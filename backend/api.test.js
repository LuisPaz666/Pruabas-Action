const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const axios = require('axios');

describe('Prueba de API Backend', function () {

  this.timeout(30000);

  const API_URL = 'http://localhost:5000/api';
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';
  let authToken;

  it('Debería conectar al servidor backend', async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, { timeout: 5000 });
      expect(response.status).to.equal(200);
      console.log('✓ Servidor backend disponible');
    } catch (error) {
      throw new Error(`No se puede conectar al servidor: ${error.message}`);
    }
  });

  it('Debería hacer login exitosamente', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('token');
      expect(response.data).to.have.property('role');
      expect(response.data.role).to.equal('admin');

      authToken = response.data.token;
      console.log('✓ Login exitoso, token obtenido');
    } catch (error) {
      throw new Error(`Error en login: ${error.response?.data?.message || error.message}`);
    }
  });

  it('Debería obtener la lista de productos', async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);

      expect(response.status).to.equal(200);
      expect(Array.isArray(response.data)).to.be.true;
      console.log(`✓ Se obtuvieron ${response.data.length} productos`);
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  });

  it('Debería rechazar login con credenciales inválidas', async () => {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        username: 'usuario_inexistente',
        password: 'contraseña_incorrecta'
      });
      throw new Error('Debería haber rechazado el login');
    } catch (error) {
      expect(error.response?.status).to.equal(400);
      console.log('✓ Login rechazado correctamente con credenciales inválidas');
    }
  });

  it('Debería crear un nuevo producto (requiere autenticación)', async () => {
    // Primero hacer login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    
    const token = loginResponse.data.token;

    try {
      const response = await axios.post(
        `${API_URL}/products`,
        {
          name: 'Producto Test',
          description: 'Descripción del producto de prueba',
          price: 99.99,
          stock: 50,
          image_url: 'https://via.placeholder.com/200'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('id');
      expect(response.data.name).to.equal('Producto Test');
      console.log('✓ Producto creado exitosamente con ID:', response.data.id);
    } catch (error) {
      throw new Error(`Error al crear producto: ${error.response?.data?.message || error.message}`);
    }
  });

  it('Debería rechazar crear producto sin autenticación', async () => {
    try {
      await axios.post(`${API_URL}/products`, {
        name: 'Producto No Autorizado',
        description: 'No debería crearse',
        price: 50,
        stock: 10
      });
      throw new Error('Debería haber rechazado la solicitud sin autenticación');
    } catch (error) {
      expect(error.response?.status).to.equal(401);
      console.log('✓ Solicitud rechazada correctamente sin autenticación');
    }
  });

});
