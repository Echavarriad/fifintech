import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RecoverPasswordScreen from "../screens/RecoverPasswordScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import SplashScreen from "../screens/SplashScreen";
import DashboardTabNavigator from "./DashboardTabNavigator";
import NotificationsScreen from "../screens/NotificationsScreen";
import NuevaSolicitudScreen from "../screens/NuevaSolicitudScreen";
import DetallesSolicitudScreen from "../screens/DetallesSolicitudScreen";
import { useAuth } from "../contexts/AuthContext";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  RecoverPassword: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  NuevaSolicitud: undefined;
  DetallesSolicitud: { solicitudId: string | number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoading, isLoggedIn, getUserRole } = useAuth();
  const userRole = getUserRole();

  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            {/* Mostrar el dashboard con navegación por tabs */}
            <Stack.Screen
              name="Dashboard"
              component={DashboardTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ 
                headerShown: true,
                title: "Notificaciones",
                headerBackTitle: "Volver"
              }}
            />
            <Stack.Screen
              name="NuevaSolicitud"
              component={NuevaSolicitudScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen
              name="DetallesSolicitud"
              component={DetallesSolicitudScreen}
              options={{ 
                headerShown: false
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RecoverPassword"
              component={RecoverPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
