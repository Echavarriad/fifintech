import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Animated, Image, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { DeviceDiagnostics } from '../utils/deviceDiagnostics';

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SplashScreen({ navigation }: Props) {
  // Animación para el logo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseLogo = useRef(new Animated.Value(1)).current;
  
  // Estados para el manejo de errores
  const [initStatus, setInitStatus] = useState('Iniciando aplicación...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Animaciones
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseLogo, {
          toValue: 1.05, 
          duration: 3000, 
          useNativeDriver: true,
        }),
        Animated.timing(pulseLogo, {
          toValue: 0.95, 
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Verificaciones de inicialización
    const runInitialChecks = async () => {
      try {
        setInitStatus('Verificando dispositivo...');
        await DeviceDiagnostics.getDeviceInfo();
        
        setInitStatus('Verificando almacenamiento...');
        const storageHealthy = await DeviceDiagnostics.checkAsyncStorageHealth();
        
        if (!storageHealthy) {
          setInitStatus('Reparando datos...');
          await DeviceDiagnostics.cleanCorruptedData();
        }
        
        setInitStatus('Finalizando...');
        
        // Pequeña pausa para mostrar el estado final
        setTimeout(() => {
          setInitStatus('¡Listo!');
        }, 500);
        
      } catch (error) {
        console.error('🚨 Error en verificaciones iniciales:', error);
        setIsError(true);
        setInitStatus('Error de inicialización');
      }
    };
    
    runInitialChecks();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.contentLogo, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { scale: pulseLogo }] 
          }
        ]}
      >
        <Image 
          source={require('../../assets/FiFintech.Co.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
      
      <View style={styles.statusContainer}>
        {!isError ? (
          <ActivityIndicator size="large" color="#48b783" style={styles.loader} />
        ) : (
          <Text style={styles.errorIndicator}>⚠️</Text>
        )}
        <Text style={[styles.statusText, isError && styles.errorText]}>
          {initStatus}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  contentLogo: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoImage: {
    width: Math.min(screenWidth * 0.8, 350),
    height: Math.min(screenWidth * 0.32, 140),
    marginVertical: 10,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  loader: {
    marginBottom: 15,
  },
  statusText: {
    color: "#48b783",
    fontSize: 16,
    fontFamily: "Kanit",
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#e74c3c",
  },
  errorIndicator: {
    fontSize: 24,
    marginBottom: 15,
  },
  loadingText: {
    color: "#48b783",
    fontSize: 18,
    marginTop: 25,
    fontFamily: "Kanit",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
});