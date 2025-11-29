
import React, { useEffect, useRef } from 'react';

// Declaration for global Blockly object from CDN
declare const Blockly: any;

interface BlocklyComponentProps {
  initialXml: string;
  toolbox: string;
  onCodeChange: (code: string) => void;
  onBlockCountChange?: (count: number) => void;
}

const BlocklyComponent: React.FC<BlocklyComponentProps> = ({ initialXml, toolbox, onCodeChange, onBlockCountChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;
    // Check if Blockly is loaded
    if (typeof Blockly === 'undefined') {
        console.error("Blockly not loaded");
        return;
    }

    // Define custom blocks if they don't exist
    if (!Blockly.Blocks['kru_start']) {
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "kru_start",
          "message0": "🚩 เริ่มทำงาน",
          "nextStatement": null,
          "colour": 160,
          "tooltip": "จุดเริ่มต้นของโปรแกรม",
          "helpUrl": ""
        },
        {
          "type": "kru_move",
          "message0": "เดินหน้า %1 1 ช่อง",
          "args0": [
            {
                "type": "field_label",
                "text": "➡️", // Right Arrow
                "class": "block-icon-large" 
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 260,
          "tooltip": "เดินไปข้างหน้า 1 ช่อง",
          "helpUrl": ""
        },
        {
          "type": "kru_turn_left",
          "message0": "เลี้ยวซ้าย %1",
          "args0": [
            {
                "type": "field_label",
                "text": "↩️" // Large Turn Left Arrow
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 210,
          "tooltip": "หมุนตัวไปทางซ้าย",
          "helpUrl": ""
        },
        {
          "type": "kru_turn_right",
          "message0": "เลี้ยวขวา %1",
          "args0": [
            {
                "type": "field_label",
                "text": "↪️" // Large Turn Right Arrow
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 210,
          "tooltip": "หมุนตัวไปทางขวา",
          "helpUrl": ""
        },
        // Fuel Collect Block
        {
          "type": "kru_collect",
          "message0": "เติมน้ำมัน %1",
          "args0": [
            {
                "type": "field_label",
                "text": "⛽"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 20, // Orange/Brown
          "tooltip": "เติมน้ำมันจากถัง",
          "helpUrl": ""
        },
        // Custom Thai Loop Block
        {
            "type": "kru_loop",
            "message0": "🔄 ทำซ้ำ %1 ครั้ง %2 %3",
            "args0": [
              {
                "type": "field_number",
                "name": "TIMES",
                "value": 3,
                "min": 0,
                "precision": 1
              },
              {
                "type": "input_dummy"
              },
              {
                "type": "input_statement",
                "name": "DO"
              }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 120, // Green
            "tooltip": "ทำคำสั่งข้างในซ้ำตามจำนวนรอบ",
            "helpUrl": ""
        }
      ]);

      // Define Javascript generators
      if (Blockly.JavaScript) {
        Blockly.JavaScript['kru_start'] = function(block: any) {
            return '';
        };
        Blockly.JavaScript['kru_move'] = function(block: any) {
            return `cmd('MOVE');\n`;
        };
        Blockly.JavaScript['kru_turn_left'] = function(block: any) {
            return `cmd('TURN_LEFT');\n`;
        };
        Blockly.JavaScript['kru_turn_right'] = function(block: any) {
            return `cmd('TURN_RIGHT');\n`;
        };
        Blockly.JavaScript['kru_collect'] = function(block: any) {
            return `cmd('COLLECT');\n`;
        };
        Blockly.JavaScript['kru_loop'] = function(block: any) {
            const repeats = String(Number(block.getFieldValue('TIMES')));
            const branch = Blockly.JavaScript.statementToCode(block, 'DO');
            let code = '';
            code += 'for (var i = 0; i < ' + repeats + '; i++) {\n' + branch + '}\n';
            return code;
        };
      }
    }

    // Initialize Workspace
    try {
        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: toolbox,
            scrollbars: false,
            trashcan: true,
            sounds: true,
            readOnly: false,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.6, // Slightly larger
                maxScale: 3,
                minScale: 0.5,
                scaleSpeed: 1.2
            },
            move: {
                scrollbars: true,
                drag: true,
                wheel: false
            }
        });

        const xmlStr = initialXml || '<xml><block type="kru_start" x="50" y="50"></block></xml>';
        const textToDom = Blockly.utils?.xml?.textToDom || Blockly.Xml?.textToDom;
        if (textToDom) {
            const xml = textToDom(xmlStr);
            if (Blockly.Xml?.domToWorkspace) {
                Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
            }
        }

        workspaceRef.current.addChangeListener(() => {
            if (Blockly.JavaScript) {
                try {
                    const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
                    onCodeChange(code);
                    const count = workspaceRef.current.getAllBlocks(false).length;
                    if (onBlockCountChange) onBlockCountChange(count);
                } catch (e) {
                    console.error("Error generating code", e);
                }
            }
        });

    } catch (e) {
        console.error("Blockly initialization error", e);
    }

    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolbox]); 

  return (
    <div className="w-full h-full relative font-bold">
        <div ref={blocklyDiv} className="absolute inset-0" />
    </div>
  );
};

export default BlocklyComponent;
