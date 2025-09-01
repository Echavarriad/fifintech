/**
 * Script de prueba para verificar el endpoint de la API
 */

const API_BASE_URL = "https://fifintech.co/wp-json/custom-api/v1/";
const endpoint = "mis_solicitudes";
const userId = 1; // ID de prueba

async function testAPI() {
  try {
    console.log('🔄 Probando endpoint:', `${API_BASE_URL}${endpoint}?author_id=${userId}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}?author_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.32.3',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error body:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Respuesta exitosa:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
    console.error('❌ Error completo:', error);
  }
}

// Ejecutar la prueba
testAPI();