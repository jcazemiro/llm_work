import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConstrutorProjeto } from "./paginas/ConstrutorProjeto";
import { DiagramaBlocos } from "./paginas/DiagramaBlocos";
import { UnifilarPreliminar } from "./paginas/UnifilarPreliminar";
import { Exportacao } from "./paginas/Exportacao";
import { AssistenteIA } from "./paginas/AssistenteIA";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConstrutorProjeto />} />
        <Route path="/blocos/:idProjeto" element={<DiagramaBlocos />} />
        <Route path="/unifilar/:idProjeto" element={<UnifilarPreliminar />} />
        <Route path="/exportar/:idProjeto" element={<Exportacao />} />
        <Route path="/assistente/:idProjeto" element={<AssistenteIA />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}