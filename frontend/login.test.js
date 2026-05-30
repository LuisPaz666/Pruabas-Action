const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Prueba de Login', function () {

  this.timeout(30000);

  let driver;
  const BASE_URL = 'http://localhost:5173';
  const BACKEND_URL = 'http://localhost:5000';

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('Debería cargar la página principal', async () => {
    await driver.get(BASE_URL);
    const titulo = await driver.getTitle();
    expect(titulo).to.exist;
    console.log('Título de la página:', titulo);
  });

  it('Debería navegar a la página de login', async () => {
    await driver.get(BASE_URL);
    
    // Esperar a que el botón "Entrar" sea visible y hacer clic
    const loginButton = await driver.wait(
      until.elementLocated(By.linkText('Entrar')),
      10000
    );
    await loginButton.click();
    
    // Verificar que estamos en la página de login
    await driver.wait(
      until.titleMatches(/MiniShop/),
      10000
    );
    
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('Debería permitir hacer login con credenciales válidas', async () => {
    await driver.get(`${BASE_URL}/login`);

    // Esperar a que los campos de formulario estén disponibles
    const usernameInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@placeholder="Ej. admin"]')),
      10000
    );
    
    const passwordInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@type="password"]')),
      10000
    );

    // Llenar el formulario
    await usernameInput.clear();
    await usernameInput.sendKeys('admin');
    
    await passwordInput.clear();
    await passwordInput.sendKeys('admin123');

    // Hacer clic en el botón de login
    const submitButton = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Acceder")]')),
      10000
    );
    await submitButton.click();

    // Esperar a que se redirija a la página principal
    await driver.wait(
      until.urlMatches(/\/$|\/products/),
      10000
    );

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include(BASE_URL);
    expect(currentUrl).to.not.include('/login');

    console.log('Login exitoso - URL actual:', currentUrl);
  });

  it('Debería mostrar el nombre de usuario después del login', async () => {
    await driver.get(`${BASE_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@placeholder="Ej. admin"]')),
      10000
    );
    
    const passwordInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@type="password"]')),
      10000
    );

    await usernameInput.clear();
    await usernameInput.sendKeys('admin');
    await passwordInput.clear();
    await passwordInput.sendKeys('admin123');

    const submitButton = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Acceder")]')),
      10000
    );
    await submitButton.click();

    // Esperar a que aparezca el nombre de usuario en la navbar
    const userGreeting = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "admin")]')),
      10000
    );

    const text = await userGreeting.getText();
    expect(text).to.include('admin');
    console.log('Nombre de usuario mostrado:', text);
  });

  it('Debería mostrar el botón de Admin después del login', async () => {
    await driver.get(`${BASE_URL}/login`);

    const usernameInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@placeholder="Ej. admin"]')),
      10000
    );
    
    const passwordInput = await driver.wait(
      until.elementLocated(By.xpath('//input[@type="password"]')),
      10000
    );

    await usernameInput.clear();
    await usernameInput.sendKeys('admin');
    await passwordInput.clear();
    await passwordInput.sendKeys('admin123');

    const submitButton = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Acceder")]')),
      10000
    );
    await submitButton.click();

    // Esperar a que aparezca el botón Admin
    const adminButton = await driver.wait(
      until.elementLocated(By.xpath('//a[contains(text(), "Admin")]')),
      10000
    );

    const isDisplayed = await adminButton.isDisplayed();
    expect(isDisplayed).to.be.true;
    console.log('Botón Admin está visible');
  });

});
