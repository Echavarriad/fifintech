/**
 * Script de prueba para verificar el endpoint publicar_solicitud
 */

const API_BASE_URL = "https://fifintech.co/wp-json/custom-api/v1/";
const endpoint = "publicar_solicitud";

// Datos de prueba
const testData = {
  post_author: "1",
  title: "Solicitud de préstamo de prueba",
  content: "Detalles generales de la solicitud de prueba",
  status: "draft",
  post_type: "solicitud_prestamo",
  monto_solicitado: "5000",
  plazo_en_meses: "12",
  destino_o_descripcion_del_prestamo: "Compra de equipo",
  foto_usuario: "https://example.com/uploads/foto.jpg"
};

async function testPublicarSolicitud() {
  try {
    console.log('🔄 Probando endpoint:', `${API_BASE_URL}${endpoint}`);
    console.log('📤 Datos a enviar:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'PostmanRuntime/7.32.3',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);
    
    if (!response.ok) {
      console.error('❌ Error HTTP:', response.status, response.statusText);
      console.error('❌ Error body:', responseText);
      return;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Respuesta exitosa (JSON):', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.log('⚠️ Respuesta exitosa (no JSON):', responseText);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error.message);
    console.error('❌ Error completo:', error);
  }
}

// Ejecutar la prueba
testPublicarSolicitud();