import { RECON_BASE_URL } from './config';

export function connectEventStream(onMessage: (data: any) => void) {
  const source = new EventSource(`${RECON_BASE_URL}/events`);

  source.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  source.onerror = () => {
    source.close();
  };

  return source;
}
