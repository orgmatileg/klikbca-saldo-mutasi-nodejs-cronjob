const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const iPhone = devices["iPhone 6 Plus"];

const KlikBcaSaldoGrabber = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.emulate(iPhone);
  try {
    // LOGIN

    await page.goto("https://m.klikbca.com/", {
      waitUntil: "networkidle0"
    });

    await page.type("#user_id", process.env.KLIKBCA_USER);
    await page.type("#pswd", process.env.KLIKBCA_PASSWORD);

    await Promise.all([
      page.click("[name='value(Submit)']"),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    await page.setJavaScriptEnabled(true);
    await page.waitForFunction("goToPage");

    await Promise.all([
      page.click(
        "#pagebody > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(9) > td > a > b"
      ),
      page.waitForNavigation({ waitUntil: "domcontentloaded" })
    ]);

    await Promise.all([
      page.click(
        "#pagebody > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(1) > td > a > b"
      ),
      page.waitForNavigation({ waitUntil: "domcontentloaded" })
    ]);

    const saldo = await page.evaluate(() => {
      const saldoMentah = document.querySelector(
        "#pagebody > span > table:nth-child(2) > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(3) > font > b"
      ).textContent;

      const saldoHapusKomaBelakang = saldoMentah.substr(
        0,
        saldoMentah.length - 3
      );

      return saldoHapusKomaBelakang;
    });

    await Promise.all([
      page.goto(
        "https://ibank.klikbca.com/authentication.do?value(actions)=logout"
      ),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    await browser.close();

    return await saldo;
  } catch (error) {
    console.log(error, "error");
    await Promise.all([
      page.goto(
        "https://ibank.klikbca.com/authentication.do?value(actions)=logout"
      ),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    await browser.close();

    return error;
  }
};

module.exports = KlikBcaSaldoGrabber;
