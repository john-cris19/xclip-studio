/* XClip GIF89a codec: 256-color 3/3/2 RGB palette, local and dependency-free.
   No WebAssembly, remote code, trackers or API calls. */
(() => {
  'use strict';
  const PALETTE = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    PALETTE[i * 3] = Math.round(((i >> 5) & 7) * 255 / 7);
    PALETTE[i * 3 + 1] = Math.round(((i >> 2) & 7) * 255 / 7);
    PALETTE[i * 3 + 2] = Math.round((i & 3) * 255 / 3);
  }
  function indexedPixels(rgba) {
    if (!rgba || rgba.length % 4 !== 0) throw new Error('Pixels RGBA inválidos.');
    const out = new Uint8Array(rgba.length >>> 2);
    for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
      out[j] = (rgba[i] & 0xE0) | ((rgba[i+1] & 0xE0) >>> 3) | (rgba[i+2] >>> 6);
    }
    return out;
  }
  class GifWriter {
    constructor(width, height) {
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 65535 || height > 65535) throw new Error('Tamanho GIF inválido.');
      this.w = width;
      this.h = height;
      this.parts = [];
      this.frames = 0;
      this.bytes = 0;
      this.push(new Uint8Array([71,73,70,56,57,97, width&255,width>>8,height&255,height>>8, 0xF7, 0, 0]));
      this.push(PALETTE);
      // Infinite animation; repeat count 0.
      this.push(new Uint8Array([0x21,0xff,11,78,69,84,83,67,65,80,69,50,46,48,3,1,0,0,0]));
    }
    push(bytes) { this.parts.push(bytes); this.bytes += bytes.length; }
    addFrame(indices, delayCentiseconds) {
      if (!(indices instanceof Uint8Array) || indices.length !== this.w * this.h) throw new Error('Frame GIF inválido.');
      const delay = Math.max(2, Math.min(65535, Math.round(delayCentiseconds)));
      const w = this.w, h = this.h;
      this.push(new Uint8Array([
        0x21,0xF9,4,0,delay&255,delay>>8,0,0,
        0x2C,0,0,0,0,w&255,w>>8,h&255,h>>8,0,
        8
      ]));
      const compressed = lzwCompress(indices);
      for (let i = 0; i < compressed.length; i += 255) {
        const section = compressed.subarray(i, Math.min(compressed.length,i+255));
        const block = new Uint8Array(section.length + 1);
        block[0] = section.length;
        block.set(section,1);
        this.push(block);
      }
      this.push(new Uint8Array([0]));
      this.frames++;
    }
    finish() {
      if (!this.frames) throw new Error('Nenhum frame para exportar.');
      this.push(new Uint8Array([0x3B]));
      return new Blob(this.parts, {type:'image/gif'});
    }
  }
  // GIF LZW with least-significant-bit-first codes and 12-bit dictionaries.
  function lzwCompress(input) {
    const CLEAR = 256, END = 257;
    let next = 258, bits = 9;
    let dictionary = new Map();
    const output = [];
    let bitBuffer = 0, bitCount = 0;
    function emit(code) {
      bitBuffer |= code << bitCount;
      bitCount += bits;
      while (bitCount >= 8) {
        output.push(bitBuffer & 255);
        bitBuffer >>>= 8;
        bitCount -= 8;
      }
    }
    function reset() { dictionary = new Map(); next = 258; bits = 9; }
    emit(CLEAR);
    let previous = input[0];
    for (let i = 1; i < input.length; i++) {
      const symbol = input[i];
      const key = (previous << 8) | symbol;
      const code = dictionary.get(key);
      if (code !== undefined) { previous = code; continue; }
      emit(previous);
      if (next < 4096) {
        dictionary.set(key, next++);
        // Code width follows the decoder dictionary one entry behind.
        if (next > (1 << bits) && bits < 12) bits++;
      } else {
        emit(CLEAR);
        reset();
      }
      previous = symbol;
    }
    emit(previous);
    emit(END);
    if (bitCount) output.push(bitBuffer & 255);
    return Uint8Array.from(output);
  }
  globalThis.XClipGif = Object.freeze({ GifWriter, indexedPixels, lzwCompress });
})();
