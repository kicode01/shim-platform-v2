const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const t1 = `  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const availableW = width - 64; // 32px padding on each side
        const availableH = height - 128;
        const scaleW = availableW / 3508;
        const scaleH = availableH / 2480;
        setScale(Math.min(scaleW, scaleH));
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);`;

const r1 = `  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const availableW = width - 64; // 32px padding on each side
        const availableH = height - 128;
        const isPortrait = design.orientation === 'portrait';
        const canvasW = isPortrait ? 2480 : 3508;
        const canvasH = isPortrait ? 3508 : 2480;
        const scaleW = availableW / canvasW;
        const scaleH = availableH / canvasH;
        setScale(Math.min(scaleW, scaleH));
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [design.orientation]);`;

const t2 = `        <div 
          ref={containerRef}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-start justify-center pt-24 pb-12 overflow-auto transition-all duration-300" style={{ right: (isLayersOpen && userZoom === 1) ? "300px" : "0px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
        >
          <div 
            className="shrink-0 relative transition-all duration-300"
            style={{ width: 3508 * (scale * userZoom), height: 2480 * (scale * userZoom) }}
          >
            <div 
              className="w-[3508px] h-[2480px] absolute left-0 top-0 origin-top-left bg-white shadow-xl transition-shadow"
              style={{
                transform: \`scale(\${scale * userZoom})\`,
                backgroundImage: design.backgroundImageUrl ? \`url(\${design.backgroundImageUrl})\` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
            >`;

const r2 = `        <div 
          ref={containerRef}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-start justify-center pt-24 pb-12 overflow-auto transition-all duration-300" style={{ right: (isLayersOpen && userZoom === 1) ? "300px" : "0px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
        >
          <div 
            className="shrink-0 relative transition-all duration-300"
            style={{ 
              width: (design.orientation === 'portrait' ? 2480 : 3508) * (scale * userZoom), 
              height: (design.orientation === 'portrait' ? 3508 : 2480) * (scale * userZoom) 
            }}
          >
            <div 
              className={\`absolute left-0 top-0 origin-top-left bg-white shadow-xl transition-shadow \${design.orientation === 'portrait' ? 'w-[2480px] h-[3508px]' : 'w-[3508px] h-[2480px]'}\`}
              style={{
                transform: \`scale(\${scale * userZoom})\`,
                backgroundImage: design.backgroundImageUrl ? \`url(\${design.backgroundImageUrl})\` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
            >`;

code = code.replace(t1, r1).replace(t1.replace(/\n/g, '\r\n'), r1.replace(/\n/g, '\r\n'));
code = code.replace(t2, r2).replace(t2.replace(/\n/g, '\r\n'), r2.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Replaced successfully');
