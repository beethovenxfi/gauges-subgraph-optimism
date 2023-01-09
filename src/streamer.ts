import { Address } from '@graphprotocol/graph-ts';
import { RewardDistributorUpdated } from './types/templates/ChildChainStreamer/ChildChainStreamer';
import { loadExistingStreamer } from './utils/streamer';
import { getRewardToken } from './utils/gauge';

export function handleRewardDistributorUpdated(
  event: RewardDistributorUpdated,
): void {
  const streamer = loadExistingStreamer(event.address);
  const token = getRewardToken(
    event.params.reward_token,
    Address.fromString(streamer.gauge),
  );
  if (event.params.distributor === Address.zero()) {
    token.streamer = null;
  } else {
    token.streamer = streamer.id;
  }
  token.save();
}
