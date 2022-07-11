import { Address, log } from '@graphprotocol/graph-ts';

import { GaugeCreated } from './types/GaugeFactory/GaugeFactory';
import { GaugeFactory, RootGauge, Streamer } from './types/schema';
import { getGauge } from './utils/gauge';

import {
  LiquidityGauge as LiquidityGaugeTemplate,
  RewardsOnlyGauge as RewardsOnlyGaugeTemplate,
  ChildChainStreamer as ChildChainStreamerTemplate,
} from './types/templates';

import { getPoolId } from './utils/misc';
import { RewardsOnlyGaugeCreated } from './types/ChildChainLiquidityGaugeFactory/ChildChainLiquidityGaugeFactory';
import { ArbitrumRootGaugeCreated } from './types/ArbitrumRootGaugeFactory/ArbitrumRootGaugeFactory';
import { ARBITRUM_ROOT_GAUGE_FACTORY } from './utils/constants';

function getGaugeFactory(address: Address): GaugeFactory {
  let factory = GaugeFactory.load(address.toHexString());

  if (factory == null) {
    factory = new GaugeFactory(address.toHexString());
    factory.numGauges = 0;
    factory.save();
  }

  return factory;
}

export function handleLiquidityGaugeCreated(event: GaugeCreated): void {
  let factory = getGaugeFactory(event.address);
  factory.numGauges += 1;
  factory.save();

  const poolId = getPoolId(event.params.pool);
  if (poolId === null) {
    log.warning('No poolId found for RewardsOnlyGaugeCreated event', [
      event.params.pool.toHexString(),
    ]);
    return;
  }

  let gauge = getGauge(event.params.gauge);
  gauge.poolAddress = event.params.pool;
  gauge.poolId = poolId;
  gauge.factory = event.address.toHexString();
  gauge.save();

  LiquidityGaugeTemplate.create(event.params.gauge);
}

export function handleRewardsOnlyGaugeCreated(
  event: RewardsOnlyGaugeCreated,
): void {
  let factory = getGaugeFactory(event.address);
  factory.numGauges += 1;
  factory.save();

  const poolId = getPoolId(event.params.pool);
  if (poolId === null) {
    log.warning('No poolId found for RewardsOnlyGaugeCreated event', [
      event.params.pool.toHexString(),
    ]);
    return;
  }
  let gauge = getGauge(event.params.gauge);
  gauge.streamer = event.params.streamer.toHexString();
  gauge.poolAddress = event.params.pool;
  gauge.poolId = poolId;
  gauge.factory = event.address.toHexString();
  gauge.save();

  const streamer = new Streamer(event.params.streamer.toHexString());
  streamer.address = event.params.streamer;
  streamer.gauge = gauge.id;
  streamer.save();

  RewardsOnlyGaugeTemplate.create(event.params.gauge);
  ChildChainStreamerTemplate.create(event.params.streamer);
}

export function handleRootGaugeCreated(event: ArbitrumRootGaugeCreated): void {
  const gaugeAddress = event.params.gauge;

  let gauge = new RootGauge(gaugeAddress.toHexString());
  gauge.recipient = event.params.recipient;

  if (event.address == ARBITRUM_ROOT_GAUGE_FACTORY) {
    gauge.chain = 'Arbitrum';
  } else {
    gauge.chain = 'Polygon';
  }

  gauge.save();
}
