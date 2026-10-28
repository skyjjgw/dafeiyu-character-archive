import { MathUtils } from '../../../rig3d-prototype/vendor/three.module.js';

const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const saturate=v=>MathUtils.clamp(finite(v),0,1);

// Independent continuous layers. New commands change targets; they do not
// replace frames or reset the animated figure to its bind pose.
export function createPerformanceController() {
  const values={happy:0,sad:0,wave:0,walk:0};
  let initialized=false;
  return {
    update(dt,time,input={}) {
      const step=MathUtils.clamp(finite(dt),0,.05),t=finite(time),idle=input.mode==='idle';
      const target={
        happy:input.happy===undefined?(input.mood==='happy'?1:0):saturate(input.happy),
        sad:input.sad===undefined?(input.mood==='sad'?1:0):saturate(input.sad),
        wave:input.action==='wave'?1:0,
        walk:input.action==='walk'?1:0,
      };
      for(const key of Object.keys(values)) {
        // Zero delta applies explicit calibration edits immediately. During
        // playback, transitions remain continuous and can be interrupted.
        const speed=key==='wave'?5.5:key==='walk'?4.5:8;
        const amount=step>0&&initialized?1-Math.exp(-speed*step):1;
        values[key]+=(target[key]-values[key])*amount;
      }
      initialized=true;
      // The eyes lead a small body gesture; posture follows without creating
      // a permanent neck twist. All offsets are bounded and deterministic.
      const invite=values.wave;
      const gazeX=MathUtils.clamp(finite(input.gazeX)+(idle?Math.sin(t*.71)*.10:0)+invite*.035,-1,1);
      const gazeY=MathUtils.clamp(finite(input.gazeY)+(idle?Math.sin(t*.53)*.055:0)+invite*.03,-1,1);
      const blinkPhase=(t+2.6)%4.9;
      const automaticBlink=idle&&blinkPhase<.22?Math.sin(Math.PI*blinkPhase/.22)**2:0;
      return {...input,...values,gazeX,gazeY,
        blink:Math.max(saturate(input.blink),automaticBlink),
        talking:saturate(input.talk??input.talking),
        headYawOffset:idle?Math.sin(t*.47)*.026:0,
        headPitchOffset:idle?Math.sin(t*.63+.4)*.009-invite*.014:0,
        headRoll:idle?Math.sin(t*.39)*.006:0,
      };
    },
    snapshot:()=>({...values}),
  };
}
