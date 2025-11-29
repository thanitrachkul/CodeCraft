
import { LevelConfig, Direction } from './types';

// Simplified Toolboxes

// 1. Just Start (Intro)
const TOOLBOX_START_ONLY = `
  <xml>
    <block type="kru_start"></block>
    <block type="kru_move"></block>
  </xml>
`;

// 2. Linear Move
const TOOLBOX_MOVE = `
  <xml>
    <block type="kru_start"></block>
    <block type="kru_move"></block>
  </xml>
`;

// 3. Turning
const TOOLBOX_TURN = `
  <xml>
    <block type="kru_start"></block>
    <block type="kru_move"></block>
    <block type="kru_turn_left"></block>
    <block type="kru_turn_right"></block>
  </xml>
`;

// 4. Loops
const TOOLBOX_LOOP = `
  <xml>
    <block type="kru_start"></block>
    <block type="kru_move"></block>
    <block type="kru_turn_left"></block>
    <block type="kru_turn_right"></block>
    <block type="kru_loop">
      <field name="TIMES">3</field>
    </block>
  </xml>
`;

// 5. Fuel Mission (Includes Collect Block)
const TOOLBOX_FUEL = `
  <xml>
    <block type="kru_start"></block>
    <block type="kru_move"></block>
    <block type="kru_turn_left"></block>
    <block type="kru_turn_right"></block>
    <block type="kru_collect"></block>
    <block type="kru_loop">
      <field name="TIMES">3</field>
    </block>
  </xml>
`;

export const LEVELS: LevelConfig[] = [
  // --- PHASE 1: BASICS ---
  {
    id: 1,
    title: "บทที่ 1: ก้าวแรกของหนู",
    description: "ยินดีต้อนรับครับ! ลากบล็อก 'เดินหน้า' ➡️ มาต่อ แล้วกดปุ่มรันเลย",
    hint: "เดินหน้า 1 ครั้งครับ",
    startPos: { x: 1, y: 2 },
    goalPos: { x: 2, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [],
    allowedBlocks: TOOLBOX_START_ONLY,
    idealBlockCount: 2
  },
  {
    id: 2,
    title: "บทที่ 2: เดินทางไกล",
    description: "ดาวอยู่ไกลจัง ลองเดินหน้า 3 ครั้งดูสิครับ",
    hint: "➡️ ➡️ ➡️",
    startPos: { x: 1, y: 2 },
    goalPos: { x: 4, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [],
    allowedBlocks: TOOLBOX_MOVE,
    idealBlockCount: 4
  },
  {
    id: 3,
    title: "บทที่ 3: หันซ้ายหัน",
    description: "ข้างหน้ามีกำแพง! ต้องเลี้ยวซ้ายก่อนนะครับ ↩️",
    hint: "เดิน ➡️ เลี้ยวซ้าย ↩️ แล้วเดิน ➡️",
    startPos: { x: 2, y: 4 },
    goalPos: { x: 4, y: 4 },
    startDir: Direction.NORTH,
    gridSize: 5,
    obstacles: [{ x: 2, y: 3 }, {x: 2, y: 2}],
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 5
  },
  {
    id: 4,
    title: "บทที่ 4: หันขวาหรรษา",
    description: "ลองเลี้ยวขวาดูบ้างนะครับ ↪️",
    hint: "เดิน ➡️ เลี้ยวขวา ↪️ แล้วเดิน ➡️",
    startPos: { x: 1, y: 1 },
    goalPos: { x: 3, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [{ x: 2, y: 1 }, { x: 3, y: 1 }], 
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 4
  },
  // --- PHASE 2: LOOPS & PATTERNS ---
  {
    id: 5,
    title: "บทที่ 5: เดินวนไป",
    description: "ทางยาวมาก! ใช้บล็อก 'ทำซ้ำ' ช่วยเดินหน่อยครับ (4 ช่อง)",
    hint: "ใช้บล็อกทำซ้ำ ครอบบล็อกเดินหน้า",
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [],
    allowedBlocks: TOOLBOX_LOOP,
    idealBlockCount: 3
  },
  {
    id: 6,
    title: "บทที่ 6: ขั้นบันได",
    description: "เดินขึ้นบันไดไปหาดาว (เดิน, เลี้ยว, เดิน, เลี้ยว)",
    hint: "ค่อยๆ ต่อบล็อกทีละขั้นนะครับ",
    startPos: { x: 0, y: 4 },
    goalPos: { x: 3, y: 1 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        { x: 1, y: 4 }, { x: 2, y: 4 }, 
        { x: 2, y: 3 }, { x: 3, y: 3 },
        { x: 3, y: 2 }
    ],
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 7
  },
  {
    id: 7,
    title: "บทที่ 7: ตัว U ยูเทิร์น",
    description: "เดินอ้อมกำแพงเป็นรูปตัว U นะครับ",
    hint: "เดินลง เลี้ยวขวา เดินขึ้น",
    startPos: { x: 1, y: 1 },
    goalPos: { x: 3, y: 1 },
    startDir: Direction.SOUTH,
    gridSize: 5,
    obstacles: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 0}],
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 8
  },
  {
    id: 8,
    title: "บทที่ 8: เดินอ้อมตึก",
    description: "มีตึกขวางอยู่ ต้องเดินอ้อมเป็นวงกลมไปหาดาว",
    hint: "เดินวนซ้ายหรือขวาก็ได้",
    startPos: { x: 2, y: 4 },
    goalPos: { x: 2, y: 0 }, 
    startDir: Direction.NORTH,
    gridSize: 5,
    obstacles: [
      {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}, // Wall in middle
      {x: 1, y: 2}, {x: 3, y: 2} // Cross shape
    ],
    allowedBlocks: TOOLBOX_LOOP,
    idealBlockCount: 10
  },
  // --- PHASE 3: MAZES ---
  {
    id: 9,
    title: "บทที่ 9: ก้นหอยมรณะ",
    description: "เดินวนเป็นก้นหอยเข้าไปข้างใน ระวังชนกำแพงนะ",
    hint: "เดินวนขวาไปเรื่อยๆ เข้าทางช่องว่างด้านล่าง",
    startPos: { x: 0, y: 0 },
    goalPos: { x: 2, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1},
        {x: 3, y: 2}, {x: 3, y: 3},
        {x: 1, y: 3}, // Open 2,3 (Bottom middle)
        {x: 1, y: 2} 
    ],
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 12
  },
  {
    id: 10,
    title: "บทที่ 10: เขาวงกตที่แท้จริง",
    description: "หาทางออกไปหาดาวให้ได้นะครับ ทางไม่ตันแน่นอน!",
    hint: "ลองเดินลงมาก่อน แล้วค่อยเลี้ยวขวา",
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 4 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, // Top wall
        {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, // Middle wall, but open 4,2
        {x: 1, y: 3}, {x: 1, y: 4}  // Bottom left blocker
    ],
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 14
  },
  {
    id: 11,
    title: "บทที่ 11: ลูปขั้นบันได",
    description: "บันไดยาวมาก! ใช้ลูปช่วยเดินขึ้นบันไดหน่อยครับ",
    hint: "ทำซ้ำ (เดิน, เลี้ยวขวา, เดิน, เลี้ยวซ้าย)",
    startPos: { x: 0, y: 4 },
    goalPos: { x: 3, y: 1 },
    startDir: Direction.NORTH,
    gridSize: 5,
    obstacles: [
      {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0},
      {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2} 
    ],
    allowedBlocks: TOOLBOX_LOOP,
    idealBlockCount: 6
  },
  {
    id: 12,
    title: "บทที่ 12: ถอยหลังเข้าซอง",
    description: "ต้องเดินอ้อมไปเข้าดาวจากด้านหลัง",
    hint: "เดินเลยไปก่อน แล้วเลี้ยวกลับมา",
    startPos: { x: 0, y: 2 },
    goalPos: { x: 2, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [{x: 1, y: 2}, {x: 1, y: 1}, {x: 1, y: 3}], // Wall blocking direct path
    allowedBlocks: TOOLBOX_TURN,
    idealBlockCount: 8
  },
  {
    id: 13,
    title: "บทที่ 13: ซิกแซก",
    description: "เดินซิกแซกหลบสิ่งกีดขวาง",
    hint: "ใช้ลูปช่วยได้นะ",
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [{x: 1, y: 2}, {x: 3, y: 2}],
    allowedBlocks: TOOLBOX_LOOP,
    idealBlockCount: 8
  },
  {
    id: 14,
    title: "บทที่ 14: ประลองปัญญา",
    description: "ด่านทดสอบก่อนไปเติมน้ำมัน! ใช้ทุกอย่างที่เรียนมา",
    hint: "วางแผนให้รอบคอบนะครับ",
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 4 },
    startDir: Direction.SOUTH,
    gridSize: 5,
    obstacles: [
       {x: 1, y: 0}, {x: 1, y: 1}, 
       {x: 3, y: 3}, {x: 3, y: 4},
       {x: 0, y: 3}, {x: 4, y: 1}
    ],
    allowedBlocks: TOOLBOX_LOOP,
    idealBlockCount: 10
  },
  // --- PHASE 4: FUEL MISSION ---
  {
    id: 15,
    title: "บทที่ 15: เติมพลัง",
    description: "ภารกิจใหม่! ต้องเดินไปเก็บน้ำมัน ⛽ ก่อน แล้วค่อยไปหาดาว",
    hint: "เดินไปหาถังน้ำมัน -> ใช้คำสั่ง 'เติมน้ำมัน' -> เดินไปหาดาว",
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    fuelPos: { x: 2, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 5
  },
  {
    id: 16,
    title: "บทที่ 16: แวะปั๊มข้างทาง",
    description: "น้ำมันอยู่คนละทางกับดาว ต้องแวะไปเติมก่อนนะครับ",
    hint: "เลี้ยวไปหาน้ำมันก่อนนะ",
    startPos: { x: 2, y: 4 },
    goalPos: { x: 2, y: 0 },
    fuelPos: { x: 4, y: 2 },
    startDir: Direction.NORTH,
    gridSize: 5,
    obstacles: [{x: 2, y: 2}],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 8
  },
  {
    id: 17,
    title: "บทที่ 17: มุมตึก",
    description: "น้ำมันซ่อนอยู่มุมห้อง ไปเอามาก่อนนะ",
    hint: "เดินเข้ามุมไปเอาน้ำมัน แล้วถอยออกมา",
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 4 },
    fuelPos: { x: 0, y: 4 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3} // Diagonal wall
    ],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 10
  },
  {
    id: 18,
    title: "บทที่ 18: ล้อมกรอบ",
    description: "น้ำมันอยู่กลางวงล้อม เข้าไปเติมแล้วหาทางออกมา",
    hint: "ต้องเดินอ้อมเข้าไปนะ",
    startPos: { x: 0, y: 2 },
    goalPos: { x: 4, y: 2 },
    fuelPos: { x: 2, y: 2 },
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        {x: 2, y: 1}, {x: 2, y: 3}, 
        {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3} // C shape cup around fuel
    ],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 9
  },
  {
    id: 19,
    title: "บทที่ 19: สองจิตสองใจ",
    description: "ทางแยกวัดใจ ไปเอาน้ำมันแล้วกลับมาทางเดิม หรือจะวนไปอีกทาง?",
    hint: "ลองดูว่าทางไหนใกล้กว่ากัน",
    startPos: { x: 2, y: 4 },
    goalPos: { x: 2, y: 0 },
    fuelPos: { x: 4, y: 2 },
    startDir: Direction.NORTH,
    gridSize: 5,
    obstacles: [
        {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3} // Central wall
    ],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 10
  },
  {
    id: 20,
    title: "บทที่ 20: ภารกิจสุดท้าย",
    description: "ด่านสุดท้ายแล้ว! เติมน้ำมันแล้วพุ่งชนดาวเลย!",
    hint: "คุณทำได้! สู้ๆ นะครับ",
    startPos: { x: 0, y: 0 },
    goalPos: { x: 4, y: 0 },
    fuelPos: { x: 2, y: 4 }, // Fuel at bottom
    startDir: Direction.EAST,
    gridSize: 5,
    obstacles: [
        {x: 1, y: 1}, {x: 3, y: 1},
        {x: 1, y: 3}, {x: 3, y: 3},
        {x: 2, y: 2} // Checkerboard patternish
    ],
    allowedBlocks: TOOLBOX_FUEL,
    idealBlockCount: 12
  }
];
