import {CharacterRunner} from './runner.mjs';
import {validateCharacter} from './protocol.mjs';

/** Dependency injection keeps this module testable with an isolated copy of
 * the exact shipped public SDK, without loading any installed DSH profile. */
export function createHostPlugin({TypertRemoteService,Remote}, {runnerFactory=()=>CharacterRunner.start({profile:'selected-current'})}={}) {
  const initializers=[];
  class DafeiyuCharacterService extends TypertRemoteService {
    static inject=['typertGateway'];
    constructor(ctx) {
      super(ctx,'dafeiyuCharacter',{namespace:'dafeiyuCharacter'});
      this.character=null;this.starting=null;this.disposed=false;
      for(const initialize of initializers)initialize.call(this);
      ctx.effect(()=>()=>{this.disposed=true;return this.stop();},'dafeiyu: bounded native character lifetime');
    }
    assertOwner() {
      const caller=this.ctx.invocation?.peer?.principal;
      if(caller&&caller.kind!=='owner')throw new Error('owner_required');
    }
    async start() {
      this.assertOwner();if(this.disposed)throw new Error('character_service_disposed');
      if(this.character?.closed)this.character=null;
      if(!this.character&&!this.starting)this.starting=runnerFactory().then(async runner=>{
        if(this.disposed){await runner.dispose();throw new Error('character_service_disposed');}
        this.character=runner;return runner;
      }).finally(()=>{this.starting=null;});
      await this.starting;return {running:!!this.character&&!this.character.closed};
    }
    async state(payload) {
      this.assertOwner();const safe=validateCharacter(payload);
      if(safe.type!=='character.state')throw new Error('unsupported_type');
      if(!this.character)throw new Error('character_not_started');
      if('error'in safe)safe.error=safe.error?'DSH 会话报告错误':'';
      return this.character.send(safe);
    }
    async behavior(action) {
      this.assertOwner();const safe=validateCharacter({schema:'dafeiyu.character.v1',type:'character.behavior',action});
      if(!this.character)throw new Error('character_not_started');
      return this.character.send(safe);
    }
    async stop() {
      this.assertOwner();if(this.starting){try{await this.starting;}catch{ /* cleanup still owns any settled child */ }}
      const runner=this.character;this.character=null;if(runner)await runner.dispose();return {running:false};
    }
  }
  // Standard decorator context, applied explicitly so Node ESM needs no
  // syntax transpilation. The actual official Remote function writes markers.
  for(const name of ['start','state','behavior','stop'])Remote(DafeiyuCharacterService.prototype[name],{kind:'method',name,static:false,private:false,addInitializer:fn=>initializers.push(fn)});
  return DafeiyuCharacterService;
}

// Production package entry can call this inside its existing Cordis Host.
export async function registerDshHost(ctx,options) {
  const sdk=await import('@deepseek-ai/dsh-typert-protocol');
  return ctx.plugin(createHostPlugin(sdk,options));
}
