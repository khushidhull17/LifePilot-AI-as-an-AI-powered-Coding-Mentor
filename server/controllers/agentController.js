import { asyncHandler } from '../utils/asyncHandler.js';
import {
  confirmAgentAction,
  dismissAgentAction,
  getAgentRun,
  runAgent,
  serializeAgentRun,
} from '../services/agentService.js';

export const run = asyncHandler(async (req, res) => {
  const agentRun = await runAgent(req.user, req.body.message);
  res.status(201).json({ run: serializeAgentRun(agentRun) });
});

export const getRun = asyncHandler(async (req, res) => {
  const agentRun = await getAgentRun(req.user._id, req.params.runId);
  res.json({ run: serializeAgentRun(agentRun) });
});

export const confirm = asyncHandler(async (req, res) => {
  const { run: agentRun, result } = await confirmAgentAction(
    req.user,
    req.params.runId,
    req.body.actionId
  );
  res.json({ run: serializeAgentRun(agentRun), result });
});

export const dismiss = asyncHandler(async (req, res) => {
  const agentRun = await dismissAgentAction(req.user, req.params.runId, req.body.actionId);
  res.json({ run: serializeAgentRun(agentRun) });
});
