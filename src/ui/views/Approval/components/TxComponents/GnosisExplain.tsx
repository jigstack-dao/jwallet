import React from 'react';
import { ExplainTxResponse, Tx } from 'background/service/openapi';
import { NameAndAddress } from 'ui/component/index';
import { TxTypeComponent } from '../SignTx';
import IconGnosis from 'ui/assets/walletlogo/gnosis.png';

interface GnosisExplainProps {
  data: ExplainTxResponse;
  chainName: string;
  raw: Record<string, string | number>;
  tx: Tx;
}

const GnosisExplain = ({ data, chainName, raw, tx }: GnosisExplainProps) => {
  const handleChange = () => {
    // NOTHING
  };

  return (
    <div className="gnosis-explain">
      <div className="internal-transaction">
        Internal transaction
        <div className="bg" />
      </div>
      <div className="gnosis-address">
        <img src={IconGnosis} className="icon icon-gnosis" />
        <NameAndAddress
          address={tx.to}
          nameClass="alian-name max-117"
          addressClass="text-13"
          noNameClass="no-name"
        />
      </div>
      <TxTypeComponent
        txDetail={data}
        chainName={chainName}
        isReady
        raw={raw}
        isSpeedUp={false}
        tx={tx}
        onChange={handleChange}
      />
    </div>
  );
};

export default GnosisExplain;
