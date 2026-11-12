/**
 * Lanzador de navegador compartido por los scripts de build.
 *
 * En local usa el Chrome que descarga `puppeteer`. En Vercel/CI ese binario no
 * existe (el build no ejecuta el postinstall), así que se recurre al Chromium
 * que viaja dentro de `@sparticuz/chromium`, pensado para Amazon Linux.
 */
export const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

export async function launchBrowser() {
  const strategies =
    process.platform === "linux"
      ? [launchWithServerlessChromium, launchWithBundledChrome]
      : [launchWithBundledChrome, launchWithServerlessChromium];

  const errors = [];
  for (const strategy of strategies) {
    try {
      const browser = await strategy();
      return { browser, strategy: strategy.name };
    } catch (error) {
      errors.push(`${strategy.name}: ${error?.message || error}`);
    }
  }
  throw new Error(errors.join(" | "));
}

async function launchWithBundledChrome() {
  const { default: puppeteer } = await import("puppeteer");
  return puppeteer.launch({ headless: true, args: BROWSER_ARGS });
}

async function launchWithServerlessChromium() {
  const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
    import("@sparticuz/chromium"),
    import("puppeteer-core"),
  ]);
  return puppeteer.launch({
    // `--single-process` viene por defecto en @sparticuz/chromium y hace que
    // Chrome se caiga al abrir varias pestañas.
    args: [...chromium.args.filter((arg) => arg !== "--single-process"), ...BROWSER_ARGS],
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
  });
}
