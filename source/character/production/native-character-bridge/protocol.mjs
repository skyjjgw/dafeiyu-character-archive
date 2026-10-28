export const PREFIX = '@DAFEIYU/1 ';
export const MAX_LINE_BYTES = 4096;
export const SCHEMA = 'dafeiyu.character.v1';
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
export function validateCharacter(payload) {
  if (!plain(payload)) throw new Error('invalid_payload');
  if (payload.schema !== SCHEMA) throw new Error('unsupported_schema');
  const behavior = payload.type === 'character.behavior';
  const allowed = behavior ? ['schema','type','action'] : ['schema','type','connected','running','approvals','error'];
  if (Object.keys(payload).some(key => !allowed.includes(key))) throw new Error('unsupported_field');
  if (behavior) {
    if (!['wave','pickup','release','cancel'].includes(payload.action)) throw new Error('unsupported_behavior');
  } else {
    if (payload.type !== 'character.state') throw new Error('unsupported_type');
    for (const key of ['connected','running']) if (key in payload && typeof payload[key] !== 'boolean') throw new Error('invalid_state');
    if ('approvals' in payload && (!Number.isSafeInteger(payload.approvals) || payload.approvals < 0 || payload.approvals > 10000)) throw new Error('invalid_approvals');
    if ('error' in payload && (typeof payload.error !== 'string' || [...payload.error].length > 200)) throw new Error('invalid_error');
  }
  return {...payload};
}

// Deliberately project only actual lifecycle facts, never transcript, tool args,
// account/provider fields, raw errors, or a fabricated speaking channel.
export function projectDshState(snapshot) {
  const selected = snapshot?.session;
  return {schema:SCHEMA,type:'character.state',connected:snapshot?.connected === true,
    running:selected?.status === 'running' || selected?.running === true,
    approvals:Math.min(10000, Array.isArray(snapshot?.approvals) ? snapshot.approvals.length : Array.isArray(selected?.approvals) ? selected.approvals.length : 0),
    error:snapshot?.error || selected?.error ? 'DSH 会话报告错误' : ''};
}
