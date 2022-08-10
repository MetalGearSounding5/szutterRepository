/// <reference types="vite/client" />
import { Engine } from './src/engine';
import { prepareContext } from './src/prepare-context';
import { calculateDesiredFramesPerSecond } from './src/get-refresh-rate';

export type Point = { x: number, y: number };
export type TimeStamp = DOMHighResTimeStamp;

declare global {
  interface Window {
    desiredFramesPerSecond: number;
    debugMode: boolean
  }
}

window.addEventListener('keydown', ({code}) => {
    if (code !== 'F9') return;
    window.debugMode = !window.debugMode;
});

window.desiredFramesPerSecond = await calculateDesiredFramesPerSecond();
const context = prepareContext();
const engine = new Engine(context);

if (import.meta.hot) {
  let currentHotEngine = engine;
  import.meta.hot.accept('./src/engine', module => {
    cancelAnimationFrame(currentHotEngine.requestAnimationFrameId!);
    currentHotEngine = Object.assign(new module!.Engine(context), currentHotEngine);
  });
}

if ('gpu' in navigator) {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw Error('Couldn\'t request WebGPU adapter.');

  const device = await adapter.requestDevice();
  if (!device) throw Error('Couldn\'t request WebGPU logical device.');

  const module = device.createShaderModule({
    code: `  
      @group(0) @binding(0)
      var<storage, read> input: array<f32>;
      
      @group(0) @binding(1)
      var<storage, read_write> output: array<f32>;
    
      @compute @workgroup_size(64)
      fn main(
        @builtin(global_invocation_id)
        global_id: vec3<u32>,
        
        @builtin(local_invocation_id)
        local_id: vec3<u32>
      ) {
        output[global_id.x] = f32(global_id.x) * 1000. + f32(local_id.x);
      }
    `,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: 'storage'
      },
    }],
  });

  const pipeline = device.createComputePipeline({
    compute: {
      module,
      entryPoint: 'main',
    },
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    })
  });

  const BUFFER_SIZE = 1000;
  const output = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const input = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const stagingBuffer = device.createBuffer({
    size: BUFFER_SIZE,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: input,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: output,
        },
    }],
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(BUFFER_SIZE / 64));
  passEncoder.end();
  commandEncoder.copyBufferToBuffer(
    output,
    0,
    stagingBuffer,
    0,
    BUFFER_SIZE
  );
  const commands = commandEncoder.finish();
  device.queue.submit([commands]);

  await stagingBuffer.mapAsync(
    GPUMapMode.READ,
    0,
    BUFFER_SIZE
  );
  const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE);
  const data = copyArrayBuffer.slice(0);
  stagingBuffer.unmap();
  console.log(new Float32Array(data));
}
