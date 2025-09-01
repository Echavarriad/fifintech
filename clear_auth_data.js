// Script temporal para limpiar datos de autenticación
// Ejecutar este script para forzar un nuevo login y obtener datos actualizados

const { authService } = require('./src/services/auth.service.ts');

async function clearAuthData() {
  try {
    console.log('🧹 Limpiando datos de autenticación...');
    await authService.clearAllAuthData();
    console.log('✅ Datos limpiados. Por favor, vuelve a hacer login.');
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
  }
}

clearAuthData();