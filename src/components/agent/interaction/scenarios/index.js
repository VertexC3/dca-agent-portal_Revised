import refillInbound from './refillInbound';
import paymentOutbound from './paymentOutbound';
import chatSideEffect from './chatSideEffect';
import distressCall from './distressCall';
import callbackTask from './callbackTask';

export const scenarios = {
  [refillInbound.id]:  refillInbound,
  [paymentOutbound.id]: paymentOutbound,
  [chatSideEffect.id]: chatSideEffect,
  [distressCall.id]:   distressCall,
  [callbackTask.id]:   callbackTask,
};

export const scenarioList = Object.values(scenarios);
