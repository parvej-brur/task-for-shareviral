import {
  Oswald_300Light,
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from "@expo-google-fonts/oswald";
import {
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  useFonts,
} from "@expo-google-fonts/roboto";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AppFonts, Colors } from "@/constants/theme";
import { TasksProvider } from "@/contexts/TasksProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded, fontError] = useFonts({
    // Roboto
    Roboto_100Thin,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
    // Oswald
    Oswald_300Light,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <TasksProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerShadowVisible: false,
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontFamily: AppFonts.headingSemiBold,
              fontSize: 17,
              color: Colors.text,
            },
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="task/new" options={{ title: "New task" }} />
          <Stack.Screen name="task/[id]" options={{ title: "Task details" }} />
          <Stack.Screen
            name="task/edit/[id]"
            options={{ title: "Edit task", presentation: "modal" }}
          />
        </Stack>
      </TasksProvider>
      <StatusBar style="dark" />
      <Toast topOffset={insets.top + 5} />
    </ThemeProvider>
  );
}
