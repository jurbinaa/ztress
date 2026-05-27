/**
 * App.tsx — Componente raíz de la aplicación.
 *
 * Actúa como shell minimalista que simplemente delega toda la lógica
 * de layout y navegación al componente ZenWrapper. Esta separación
 * mantiene el punto de entrada limpio y facilita añadir proveedores
 * globales (contextos, temas, etc.) en el futuro sin tocar el layout.
 */
import ZenWrapper from './components/layout/ZenWrapper';

function App() {
  return (
    <ZenWrapper />
  );
}

export default App;
