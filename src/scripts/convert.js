import pako from 'pako';

const RPO1_MAGIC = 0x52504F31;
const RPOZ_MAGIC = 0x789C;

function startsWith(buffer, magic, length) {
  if (buffer.length < length) return false;
  for (let i = 0; i < length; i++) {
    if (buffer[i] !== ((magic >> ((length - 1 - i) * 8)) & 0xFF)) {
      return false;
    }
  }
  return true;
}

/**
 * Converts RPO/RPOZ binary data to a GLB object.
 * @param {Uint8Array} rpoData - The input RPO/RPOZ binary data.
 * @param {string} name - The name for the GLTF mesh.
 * @returns {Uint8Array|null} - The resulting GLB binary data or null on error.
 */
export function convertBuffer(rpoData, name) {
  let bin;

  if (startsWith(rpoData, RPO1_MAGIC, 4)) {
    bin = rpoData;
  } else if (startsWith(rpoData, RPOZ_MAGIC, 2)) {
    try {
      bin = pako.inflate(rpoData);
    } catch (e) {
      console.error("Error decompressing RPOZ data:", e);
      return null;
    }
  } else {
    console.error("error: provided buffer is not a valid .rpo(z) file");
    return null;
  }

  if (bin.length < 12) {
    console.error("error: buffer too small to contain header");
    return null;
  }

  const vertexCount = bin.slice(4, 8).reduce((acc, byte, idx) => acc + byte * (256 ** idx), 0);
  const faceBytes = bin.slice(8, 12).reduce((acc, byte, idx) => acc + byte * (256 ** idx), 0);

  let strides = [];
  let currentBin = bin.slice();

  while (currentBin.slice(0, 4).reduce((acc, byte, idx) => acc + byte * (256 ** idx), 0) !== faceBytes / 2) {
    if (currentBin.length < 8) {
      console.error("error: RPO file was invalid, could not find end of header");
      return null;
    }

    const next4Bytes = currentBin.slice(4, 8);
    if (next4Bytes.every((byte, idx) => byte === [0x06, 0x14, 0x00, 0x00][idx])) {
      strides.push(currentBin[0]);
    }

    currentBin = currentBin.slice(4);
  }

  currentBin = currentBin.slice(4);

  const bufferLen = currentBin.length;
  const strideLen = strides.reduce((a, b) => a + b, 0);

  let gltf = {
    asset: {
      version: "2.0"
    },
    buffers: [],
    bufferViews: [],
    accessors: [],
    materials: [],
    meshes: [],
    nodes: [],
    scenes: [],
    scene: 0
  };

  const bufferIndex = 0;
  gltf.buffers.push({
    byteLength: bufferLen
  });

  let offset = 0;
  let bufferViewIndices = [];

  strides.forEach(stride => {
    const byteStride = strideLen * 4;
    const byteLength = vertexCount * strideLen * 4;
    gltf.bufferViews.push({
      buffer: bufferIndex,
      byteOffset: offset,
      byteLength: byteLength,
      byteStride: byteStride
    });
    bufferViewIndices.push(gltf.bufferViews.length - 1);
    offset += stride * 4;
  });

  gltf.bufferViews.push({
    buffer: bufferIndex,
    byteOffset: vertexCount * strideLen * 4,
    byteLength: faceBytes
  });
  const indicesBufferView = gltf.bufferViews.length - 1;

  strides.forEach((stride, idx) => {
    let accessorType;
    switch (stride) {
      case 2:
        accessorType = "VEC2";
        break;
      case 3:
      case 4:
        accessorType = "VEC3";
        break;
      default:
        accessorType = "SCALAR";
    }

    gltf.accessors.push({
      bufferView: bufferViewIndices[idx],
      byteOffset: 0,
      componentType: 5126,
      count: vertexCount,
      type: accessorType
    });
  });

  gltf.accessors.push({
    bufferView: indicesBufferView,
    byteOffset: 0,
    componentType: 5123,
    count: faceBytes / 2,
    type: "SCALAR"
  });

  const materialIndex = 0;
  gltf.materials.push({
    name: "default",
    pbrMetallicRoughness: {
      baseColorFactor: [1.0, 1.0, 1.0, 1.0],
      metallicFactor: 0,
      roughnessFactor: 1
    },
    emissiveFactor: [0.0, 0.0, 0.0],
    alphaMode: "OPAQUE",
    doubleSided: false
  });

  let attributes = {
    POSITION: 0
  };
  if (gltf.accessors.length > 2 && strides[1] >= 3) {
    attributes["COLOR_0"] = 1;
  }
  if (gltf.accessors.length > 3 && strides[2] === 3) {
    attributes["NORMAL"] = 2;
  }

  const primitive = {
    attributes: attributes,
    indices: gltf.accessors.length - 1,
    material: materialIndex,
    mode: 4
  };

  const meshIndex = 0;
  gltf.meshes.push({
    primitives: [primitive],
    name: name
  });

  const nodeIndex = 0;
  gltf.nodes.push({
    mesh: meshIndex
  });

  gltf.scenes.push({
    nodes: [nodeIndex]
  });

  gltf.scene = 0;

  let jsonString = JSON.stringify(gltf);
  const padding = (4 - (jsonString.length % 4)) % 4;
  jsonString = jsonString + ' '.repeat(padding);

  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(jsonString);
  const binBytes = currentBin;

  const HEADER_LENGTH = 12;
  const JSON_CHUNK_HEADER_LENGTH = 8;
  const BIN_CHUNK_HEADER_LENGTH = 8;

  const jsonChunkLength = jsonBytes.length;
  const binChunkLength = binBytes.length;

  const totalLength = HEADER_LENGTH +
    JSON_CHUNK_HEADER_LENGTH + jsonChunkLength +
    BIN_CHUNK_HEADER_LENGTH + binChunkLength;

  const glbBuffer = new Uint8Array(totalLength);

  const magic = new TextEncoder().encode('glTF');
  glbBuffer.set(magic, 0);
  const view = new DataView(glbBuffer.buffer);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);

  let offsetPosition = HEADER_LENGTH;

  view.setUint32(offsetPosition, jsonChunkLength, true);
  view.setUint32(offsetPosition + 4, 0x4E4F534A, true);
  offsetPosition += JSON_CHUNK_HEADER_LENGTH;

  glbBuffer.set(jsonBytes, offsetPosition);
  offsetPosition += jsonChunkLength;

  view.setUint32(offsetPosition, binChunkLength, true);
  view.setUint32(offsetPosition + 4, 0x004E4942, true);
  offsetPosition += BIN_CHUNK_HEADER_LENGTH;

  glbBuffer.set(binBytes, offsetPosition);

  return glbBuffer;
}
