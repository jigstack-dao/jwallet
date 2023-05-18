import React from 'react';
import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import InputText from '@/ui/component/Inputs/InputText';
import CloudUpload from '@/ui/assets/jwallet/cloud-upload-empty.svg';
import './index.less';
import { ReactComponent as PlusIcon } from '@/ui/assets/jwallet/plusWhite.svg';
import ConfirmSendGiftModal from '../ConfirmSendGiftModal';
import { ReactComponent as ChevronUp } from '@/ui/assets/jwallet/chevron-up.svg';
import { ReactComponent as ChevronDown } from '@/ui/assets/jwallet/chevron-down.svg';
import TokenDropdown from '../TokenDropdown';
import { BigNumber } from 'ethers';
import { MINIMUM_GAS_LIMIT } from '@/constant';
import useSendGiftSanta from '@/hooks/forms/useSendGiftSanta';
import { SendGiftFormStep } from '@/constant/santa';
const SendGiftForm: React.FC<{ token: string }> = ({ token }) => {
  const {
    imgUploaded,
    inputRef,
    imgFile,
    tokenSelectedAddress,
    tokens,
    step,
    gasLimit,
    openConfirm,
    recipients,
    title,
    setTitle,
    addRecipient,
    onOpenFile,
    onChangeFile,
    onChangeToken,
    setGasLimit,
    onSubmit,
    onSendGift,
    canSubmit,
    setOpenConfirm,
    clearAll,
    onRecipientChange,
    renderBalanceOf,
  } = useSendGiftSanta(token);

  return (
    <>
      <div id="send-gift-form-container">
        {!imgUploaded && (
          <div className="upload-container" onClick={onOpenFile}>
            <div className="upload-icon">
              <img src={CloudUpload} width={36} height={29} />
            </div>
            <div className="title-1">Upload a gift card</div>
            <div className="title-2">png, jpeg up to 100Mb</div>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={onChangeFile}
              onClick={(e) => e.stopPropagation()}
              className="hidden"
              ref={inputRef}
            />
          </div>
        )}
        {imgUploaded && imgFile && (
          <div className="uploaded-container">
            <img src={URL.createObjectURL(imgFile)} alt="" />
          </div>
        )}
        <div className="mb-4">
          <InputText
            placeHolder="Title. Think of somethig interesting"
            value={title}
            name="title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {recipients.map((item, index) => (
          <div key={index}>
            <div className="mb-4">
              <InputText
                placeHolder="Comment"
                value={item.comment}
                name="comment"
                onChange={(e) => {
                  onRecipientChange('comment', e.target.value, index);
                }}
              />
            </div>
            <div className="mb-4">
              <InputText
                placeHolder="Email receiver"
                value={item.email}
                name="emailReceiver"
                onChange={(e) => {
                  onRecipientChange('email', e.target.value, index);
                }}
              />
              <span className="text-orange text-14">{item.errorEmail}</span>
            </div>
            <div>
              <TokenDropdown
                addressSelected={tokenSelectedAddress}
                tokens={tokens}
                amount={item.amount}
                onChangeToken={onChangeToken}
                onChangeAmount={(value) => {
                  onRecipientChange('amount', value, index);
                }}
                disabledChange={recipients.length > 1}
              />
              <div className="text-orange text-14">{item.errorAmount}</div>
            </div>
            <div className="w-full text-right opacity-60 mb-2">
              Available balance: {renderBalanceOf()}
            </div>
            <div className="line-border"></div>
          </div>
        ))}

        {step == SendGiftFormStep.Initial && (
          <button
            className="one-more hover-overlay p-2 w-fit mx-auto rounded-md"
            onClick={addRecipient}
          >
            <span>
              <PlusIcon />
            </span>
            <span>One more Recipient</span>
          </button>
        )}
        {step == SendGiftFormStep.FilledForm && (
          <div className="fee">
            <div className="title">Transaction fee</div>
            <div className="input">
              <div>GWEI</div>
              <input
                type="text"
                value={gasLimit.toNumber()}
                onChange={(e) => setGasLimit(BigNumber.from(e.target.value))}
              />
              <div className="buttons">
                <div>
                  <button onClick={() => setGasLimit(gasLimit.add(1))}>
                    <ChevronUp />
                  </button>
                </div>
                <div>
                  <button onClick={() => setGasLimit(gasLimit.sub(1))}>
                    <ChevronDown />
                  </button>
                </div>
              </div>
            </div>
            <span className="text-orange text-14">
              {gasLimit.lt(BigNumber.from(MINIMUM_GAS_LIMIT)) &&
                'Gas Limit is low, the transaction may fail'}
            </span>
          </div>
        )}
        <div>
          <StrayButtons
            backTitle="CLEAR ALL"
            nextTitle={step == SendGiftFormStep.Initial ? 'NEXT' : 'SEND'}
            disabledNext={!canSubmit()}
            onBack={clearAll}
            onNext={onSubmit}
          />
        </div>
      </div>
      {openConfirm && (
        <ConfirmSendGiftModal
          onClose={() => {
            setOpenConfirm(false);
          }}
          onConfirm={() => {
            onSendGift();
          }}
          title={title}
          recipients={recipients}
          imgURL={imgFile ? URL.createObjectURL(imgFile) : ''}
          tokenSelectedAddress={tokenSelectedAddress || ''}
          tokens={tokens}
        />
      )}
    </>
  );
};

export default SendGiftForm;
