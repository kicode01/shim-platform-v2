const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Import Hand
if (!code.includes('Hand,')) {
  code = code.replace('import { LayoutTemplate, ', 'import { LayoutTemplate, Hand, ');
}

// 2. Add State and Hooks
const stateTarget = `  const [userZoom, setUserZoom] = useState(1);
  const [isLayersOpen, setIsLayersOpen] = useState(false);`;

const stateReplacement = `  const [userZoom, setUserZoom] = useState(1);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  
  // Pan & Zoom Logic
  const [isPanMode, setIsPanMode] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hasOverflow, setHasOverflow] = useState(false);
  
  useEffect(() => {
    if (userZoom <= 1) {
      setPanOffset({ x: 0, y: 0 });
      setIsPanMode(false);
    }
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const isPortrait = design.orientation === 'portrait';
      const canvasW = isPortrait ? 2480 : 3508;
      const canvasH = isPortrait ? 3508 : 2480;
      
      const visualW = canvasW * scale * userZoom;
      const visualH = canvasH * scale * userZoom;
      
      setHasOverflow(visualW > clientWidth || visualH > clientHeight);
    }
  }, [scale, userZoom, design.orientation]);

  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPanMode && hasOverflow) {
      isDraggingCanvas.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y
      };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas.current && isPanMode && hasOverflow) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPanOffset({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy
      });
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingCanvas.current = false;
  };`;

code = code.replace(stateTarget, stateReplacement);
if (code.indexOf(stateReplacement) === -1) {
  code = code.replace(stateTarget.replace(/\n/g, '\r\n'), stateReplacement.replace(/\n/g, '\r\n'));
}

// 3. Update the container and canvas
const containerTarget = `            <div 
              ref={containerRef}
              className="flex-1 min-h-0 relative flex items-center justify-center bg-gray-200 overflow-hidden" 
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
            >
              
              <div 
                className="w-[3508px] h-[2480px] shrink-0 relative bg-white shadow-md border border-zinc-200"
                style={{
                  transform: \`scale(\${scale * userZoom})\`,
                  transformOrigin: 'center center',`;

const containerReplacement = `            <div 
              ref={containerRef}
              className={\`flex-1 min-h-0 relative flex items-center justify-center bg-zinc-200/50 overflow-hidden \${isPanMode && hasOverflow ? 'cursor-grab active:cursor-grabbing' : ''}\`} 
              onClick={(e) => { if (e.target === e.currentTarget && !isPanMode) setSelectedElementId(null); }}
              onDoubleClick={(e) => {
                if (hasOverflow) {
                  setIsPanMode(!isPanMode);
                }
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              
              <div 
                className="shrink-0 relative bg-white shadow-md border border-zinc-200 transition-transform duration-75"
                style={{
                  width: design.orientation === 'portrait' ? '2480px' : '3508px',
                  height: design.orientation === 'portrait' ? '3508px' : '2480px',
                  transform: \`translate(\${panOffset.x}px, \${panOffset.y}px) scale(\${scale * userZoom})\`,
                  transformOrigin: 'center center',`;

code = code.replace(containerTarget, containerReplacement);
if (code.indexOf(containerReplacement) === -1) {
  code = code.replace(containerTarget.replace(/\n/g, '\r\n'), containerReplacement.replace(/\n/g, '\r\n'));
}

// 4. Add the Pan toggle button to the Zoom Controls
const zoomTarget = `              {/* Interactive Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
                <button onClick={() => setUserZoom(p => Math.max(0.1, p - 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">`;

const zoomReplacement = `              {/* Interactive Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
                {hasOverflow && (
                  <button 
                    onClick={() => setIsPanMode(!isPanMode)} 
                    className={\`p-1 mr-1 rounded transition-colors \${isPanMode ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-zinc-100 text-zinc-600'}\`} 
                    title="Toggle Pan Mode (Double-click canvas to quickly toggle)"
                  >
                    <Hand size={14} />
                  </button>
                )}
                <button onClick={() => setUserZoom(p => Math.max(0.1, p - 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">`;

code = code.replace(zoomTarget, zoomReplacement);
if (code.indexOf(zoomReplacement) === -1) {
  code = code.replace(zoomTarget.replace(/\n/g, '\r\n'), zoomReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully added pan mode!');
