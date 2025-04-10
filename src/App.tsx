import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, extendTheme, ThemeConfig } from '@chakra-ui/react';
import { AlertProvider } from "./components/AlertProvider";
import SetRoomId from "./pages/setroomid";
import Room from "./pages/room";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f3e9fd',
      100: '#e1c8fb',
      200: '#d1a9f9',
      300: '#c18af7',
      400: '#a95cf3',
      500: '#7a15e6', // Primary
      600: '#6712c1',
      700: '#550e9e',
      800: '#430a7a',
      900: '#320758',
    },
    gray: {
      50: '#f9fafb',
      100: '#f2f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold', // Applies to all buttons
      },
      variants: {
        solid: (props: { colorMode: string; }) => ({
          bg: props.colorMode === 'light' ? 'brand.500' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'light' ? 'brand.400' : 'brand.400',
          },
        }),
        outline: (props: { colorMode: string; }) => ({
          borderColor: props.colorMode === 'light' ? 'brand.500' : 'brand.300',
          color: props.colorMode === 'light' ? 'brand.500' : 'brand.300',
          _hover: {
            bg: props.colorMode === 'light' ? 'brand.100' : 'brand.700',
          },
        }),
      },
      defaultProps: {
        variant: 'solid', // Default variant
        colorScheme: 'brand', // Default color scheme
      },
    },
    Input: {
      baseStyle: {
        // Shared styles for all variants
      },
      sizes: {
        // Custom sizes if needed
      },
      variants: {
        filled: {
          field: {
            borderColor: 'gray.300',
            _hover: { borderColor: 'gray.400' }, // Hover state
            _focus: { borderColor: 'gray.500', boxShadow: '0 0 0 1px grey.500' }, // Focus state
          },
        },
      },
      defaultProps: {
        variant: 'filled', // Set the default variant for all Inputs
      },
    },
  },
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
});


function App() {
  return (
    <ChakraProvider theme={theme}>
      <AlertProvider>
        <Router>
          <Routes>
            {/* Default route: go to /set-room-id */}
            <Route path="/" element={<Navigate to="/set-room-id" replace />} />
            <Route path="/set-room-id" element={<SetRoomId />} />
            {/* Room route with dynamic param */}
            <Route path="/room/:roomId" element={<Room />} />
            {/* Catch-all - if you want. Otherwise, remove or handle differently */}
            <Route path="*" element={<Navigate to="/set-room-id" replace />} />
          </Routes>
        </Router>
      </AlertProvider>
    </ChakraProvider>
  );
}

export default App;
