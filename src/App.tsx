// src/components/PromptBuilderUI.tsx

import React, { useState } from 'react';
import { PlusCircle, Trash2, Clipboard } from 'lucide-react';

// --- Tipos para el estado del componente ---
interface ContextItem {
  id: number;
  key: string;
  value: string;
}

interface ListItem {
  id: number;
  text: string;
}

// --- Componente principal ---
const App: React.FC = () => {
  // --- Estados para cada sección del prompt ---
  const [role, setRole] = useState<string>('Actúa como un desarrollador senior experto en...');
  const [task, setTask] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('Responde únicamente con el código en un bloque markdown.');

  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [instructions, setInstructions] = useState<ListItem[]>([]);
  const [constraints, setConstraints] = useState<ListItem[]>([]);
  
  const [newContextKey, setNewContextKey] = useState<string>('');
  const [newContextValue, setNewContextValue] = useState<string>('');
  const [newInstruction, setNewInstruction] = useState<string>('');
  const [newConstraint, setNewConstraint] = useState<string>('');

  const [enableClarification, setEnableClarification] = useState<boolean>(true);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');

  // --- Funciones para manejar listas dinámicas ---
  const addContext = () => {
    if (newContextKey.trim() && newContextValue.trim()) {
      setContexts([...contexts, { id: Date.now(), key: newContextKey, value: newContextValue }]);
      setNewContextKey('');
      setNewContextValue('');
    }
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setInstructions([...instructions, { id: Date.now(), text: newInstruction }]);
      setNewInstruction('');
    }
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setConstraints([...constraints, { id: Date.now(), text: newConstraint }]);
      setNewConstraint('');
    }
  };

  const removeItem = <T extends { id: number }>(
    list: T[], 
    setter: React.Dispatch<React.SetStateAction<T[]>>, 
    id: number
  ) => {
    setter(list.filter(item => item.id !== id));
  };

  // --- Función para construir y mostrar el prompt ---
  const buildPrompt = () => {
    let prompt = `# Rol: \n${role}\n\n`;
    
    if (contexts.length > 0) {
      prompt += `# Contexto:\n${contexts.map(c => `- ${c.key}: ${c.value}`).join('\n')}\n\n`;
    }
    
    prompt += `# Tarea: \n${task}\n\n`;

    if (instructions.length > 0) {
      prompt += `# Instrucciones:\n${instructions.map((inst, i) => `${i + 1}. ${inst.text}`).join('\n')}\n\n`;
    }

    if (constraints.length > 0) {
      prompt += `# Restricciones:\n${constraints.map(c => `- ${c.text}`).join('\n')}\n\n`;
    }

    prompt += `# Formato de Salida: \n${outputFormat}\n`;

    if (enableClarification) {
      prompt += '\n---\n';
      prompt += '# Instrucción Final:\n Si te falta información crítica para dar una respuesta precisa, no adivines. En su lugar, hazme las preguntas necesarias.';
    }

    setGeneratedPrompt(prompt.trim());
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
        setCopySuccess('¡Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
        setCopySuccess('Error al copiar');
    });
  };

  // --- Renderizado del componente ---
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-2xl max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">Constructor de Prompts</h1>
      <p className="text-gray-400 mb-8">Diseña prompts de alta calidad para obtener mejores resultados de los LLMs.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna de Entradas */}
        <div className="space-y-6">
          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">🎭 Rol (Persona)</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Tarea */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">🎯 Tarea</label>
            <textarea 
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="Ej: Genera una función que..."
            />
          </div>

          {/* Contexto */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">背景 Contexto</label>
            {contexts.map(ctx => (
              <div key={ctx.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                <span className="font-semibold text-cyan-400">{ctx.key}:</span>
                <span className="text-gray-300 flex-grow">{ctx.value}</span>
                <button onClick={() => removeItem(contexts, setContexts, ctx.id)} className="text-red-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input type="text" value={newContextKey} onChange={e => setNewContextKey(e.target.value)} placeholder="Clave" className="w-1/3 bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              <input type="text" value={newContextValue} onChange={e => setNewContextValue(e.target.value)} placeholder="Valor" className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
              <button onClick={addContext} className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded-md"><PlusCircle size={20} /></button>
            </div>
          </div>
          
          {/* Instrucciones */}
          <DynamicList
            title="📝 Instrucciones"
            items={instructions}
            setItems={setInstructions}
            newItem={newInstruction}
            setNewItem={setNewInstruction}
            addItem={addInstruction}
            removeItem={removeItem}
          />
          
          {/* Restricciones */}
          <DynamicList
            title="⛓️ Restricciones"
            items={constraints}
            setItems={setConstraints}
            newItem={newConstraint}
            setNewItem={setNewConstraint}
            addItem={addConstraint}
            removeItem={removeItem}
          />
          
          {/* Formato Salida y Toggle */}
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">📄 Formato de Salida</label>
            <input 
              type="text" 
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          
          <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
            <label htmlFor="clarification" className="font-medium text-gray-300">Habilitar cláusula de clarificación</label>
            <input
              id="clarification"
              type="checkbox"
              checked={enableClarification}
              onChange={(e) => setEnableClarification(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Columna de Salida */}
        <div className="space-y-4">
          <button
            onClick={buildPrompt}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Construir Prompt
          </button>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">Prompt Generado</label>
            <textarea
              readOnly
              value={generatedPrompt}
              rows={25}
              className="w-full bg-gray-950 border border-gray-700 rounded-md p-4 font-mono text-sm leading-relaxed"
              placeholder="El prompt generado aparecerá aquí..."
            />
            {generatedPrompt && (
              <div className="absolute top-10 right-2">
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-white p-2 bg-gray-800 rounded-md">
                  {copySuccess ? <span className="text-xs text-green-400">{copySuccess}</span> : <Clipboard size={18}/>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponente para listas dinámicas para no repetir código ---

interface DynamicListProps {
  title: string;
  items: ListItem[];
  setItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
  newItem: string;
  setNewItem: (value: string) => void;
  addItem: () => void;
  removeItem: <T extends { id: number }>(
    list: T[], 
    setter: React.Dispatch<React.SetStateAction<T[]>>, 
    id: number
  ) => void;
}

const DynamicList: React.FC<DynamicListProps> = ({ title, items, setItems, newItem, setNewItem, addItem, removeItem }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-300">{title}</label>
    {items.map(item => (
      <div key={item.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded-md text-gray-300">
        <span className="flex-grow">{item.text}</span>
        <button onClick={() => removeItem(items, setItems, item.id)} className="text-red-500 hover:text-red-400">
          <Trash2 size={16} />
        </button>
      </div>
    ))}
    <div className="flex gap-2">
      <input
        type="text"
        value={newItem}
        onChange={(e) => setNewItem(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && addItem()}
        placeholder="Añadir nuevo ítem..."
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
      />
      <button onClick={addItem} className="bg-cyan-600 hover:bg-cyan-500 p-2 rounded-md"><PlusCircle size={20} /></button>
    </div>
  </div>
);

export default App;