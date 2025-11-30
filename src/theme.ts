import { MD3LightTheme as DefaultTheme } from "react-native-paper";

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#1976D2",      
    secondary: "#FFB300",    

    // Backgrounds
    background: "#F5F5FA",   
    surface: "#FFFFFF",     

    // Text colors
    onBackground: "#111827",
    onSurface: "#111827",

    outline: "#D0D4E4",      
  },
};
