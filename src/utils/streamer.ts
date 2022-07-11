import { Address } from '@graphprotocol/graph-ts';
import { Streamer } from '../types/schema';

export function loadExistingStreamer(address: Address): Streamer {
  return Streamer.load(address.toHexString()) as Streamer;
}
