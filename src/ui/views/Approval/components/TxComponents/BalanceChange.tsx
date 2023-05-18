import React from 'react';
import clsx from 'clsx';
import { useTranslation, Trans } from 'react-i18next';
import { BalanceChange as BC } from 'background/service/openapi';
import { splitNumberByStep } from 'ui/utils/number';

const BalanceChange = ({
  data,
  isSupport,
  chainName,
}: {
  data: BC;
  isSupport: boolean;
  chainName: string;
}) => {
  const { t } = useTranslation();
  const isSuccess = data.success && isSupport;
  const errorMessage = data.err_msg;
  const receiveTokenList = data.receive_token_list;
  const sendTokenList = data.send_token_list;
  const isUSDValueChangePositive = data.usd_value_change > 0;
  const isUSDValueChangeNegative = data.usd_value_change < 0;
  const hasChange =
    data.receive_token_list.length > 0 || data.send_token_list.length > 0;
  return (
    <div className="balance-change">
      <p className="section-title flex justify-between">
        <span>{t('token balance change')}</span>
      </p>
      {isSuccess && (
        <div className="gray-section-block balance-change-content">
          {hasChange ? (
            <>
              <div>
                {sendTokenList && sendTokenList.length > 0 && (
                  <ul>
                    {sendTokenList.map((token) => (
                      <li key={token.id}>
                        <div className="first-line">
                          <span className="token-symbol" title={token.symbol}>
                            {token.symbol}
                          </span>
                          <span
                            className="token-amount"
                            title={`- ${splitNumberByStep(token.amount)}`}
                          >
                            -{splitNumberByStep(token.amount)}
                          </span>
                        </div>
                        <div className="second-line">
                          ${splitNumberByStep(token.usd_value!.toFixed(2))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {receiveTokenList && receiveTokenList.length > 0 && (
                  <ul>
                    {receiveTokenList.map((token) => (
                      <li key={token.id}>
                        <div className="first-line">
                          <span className="token-symbol" title={token.symbol}>
                            {token.symbol}
                          </span>
                          <span
                            className="token-amount"
                            title={`+ ${splitNumberByStep(token.amount)}`}
                          >
                            +{splitNumberByStep(token.amount)}
                          </span>
                        </div>
                        <div className="second-line">
                          ${splitNumberByStep(token.usd_value!.toFixed(2))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="total-balance-change">
                <span className="token-symbol">{t('Total value change')}</span>
                <span
                  className={clsx('usd-value-change', {
                    'text-gray-subTitle': !data.usd_value_change,
                    green: isUSDValueChangePositive,
                    red: isUSDValueChangeNegative,
                  })}
                  title={splitNumberByStep(data.usd_value_change)}
                >
                  {isUSDValueChangePositive ? '+' : '-'}$
                  {splitNumberByStep(
                    Math.abs(data.usd_value_change).toFixed(2)
                  )}
                </span>
              </div>
            </>
          ) : (
            <span className="description">{t('No Changes')}</span>
          )}
        </div>
      )}
      {!isSuccess && (
        <div className="balance-change_error">
          {!data.success ? (
            errorMessage
          ) : (
            <Trans
              i18nKey="balanceChangeNotSupport"
              values={{ name: chainName }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceChange;
