import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* [FILL_PER_PROJECT] — add routes here */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
