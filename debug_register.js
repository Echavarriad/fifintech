const AsyncStorage = require('@react-native-async-storage/async-storage');

// Simular datos de registro
const testRegisterData = {
  username: 'testuser',
  name: 'Test User',
  lastname: 'Test Lastname',
  'no.identiti': '12345678',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'password123',
  password2: 'password123',
  address: 'Test Address',
  photo: '',
  photo_document_front: '',
  photo_document_lat: '',
  role: 'Prestatario',
  tyc: true
};

// Simular respuesta del servidor
const mockServerResponse = {
  user: {
    id: 123,
    email: 'test@example.com',
    name: 'Test User',
    role: 'cliente'
  },
  token: 'mock-token-123'
};

// Función para probar el mapeo
function testUserMapping() {
  console.log('=== PRUEBA DE MAPEO DE USUARIO ===');
  console.log('Datos de registro:', JSON.stringify(testRegisterData, null, 2));
  console.log('Respuesta del servidor:', JSON.stringify(mockServerResponse, null, 2));
  
  // Simular el mapeo que hace el servicio
  const authResponse = {
    user: {
      id: mockServerResponse.user.id || mockServerResponse.user.ID || Date.now(),
      email: mockServerResponse.user.email || testRegisterData.email,
      name: mockServerResponse.user.name || testRegisterData.name || 'Usuario',
      lastName: mockServerResponse.user.lastName || testRegisterData.lastname,
      roles: mockServerResponse.user.roles || [mockServerResponse.user.role] || ['cliente'],
      profilePicture: mockServerResponse.user.profilePicture || mockServerResponse.user.photo,
      phoneNumber: mockServerResponse.user.phoneNumber || mockServerResponse.user.phone || testRegisterData.phone,
      username: mockServerResponse.user.username || testRegisterData.username,
      lastLogin: new Date()
    },
    token: mockServerResponse.token || '',
    refreshToken: mockServerResponse.refreshToken || '',
    expiresIn: mockServerResponse.expiresIn || 3600
  };
  
  console.log('AuthResponse mapeado:', JSON.stringify(authResponse, null, 2));
  
  // Validar datos críticos
  console.log('=== VALIDACIÓN ===');
  console.log('ID válido:', !!authResponse.user.id);
  console.log('Name válido:', !!authResponse.user.name);
  console.log('ID tipo:', typeof authResponse.user.id);
  console.log('Name tipo:', typeof authResponse.user.name);
  
  return authResponse;
}

// Ejecutar prueba
testUserMapping();