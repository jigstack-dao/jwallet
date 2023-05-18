import StrayButtons from '@/ui/component/Buttons/StrayButtons';
import React, { useEffect, useState } from 'react';
import { ReactComponent as TrashIcon } from '@/ui/assets/jwallet/trash.svg';
import { Modal, Image } from 'antd';
import { useWallet } from '@/ui/utils';

import './style.less';
import { useAppContext } from '@/context';
import { ActionTypes, RefreshUseHooks } from '@/context/actions';

// const sites = [
//   {
//     icon: <ChromeIcon />,
//     link: '',
//     name: 'chrome.com',
//   },
//   {
//     icon: <StakbankIcon />,
//     link: '',
//     name: 'stakbank.com',
//   },
// ];

const ConnectSites = () => {
  const [visible, setVisible] = useState(false);
  const [Refresh, setRefresh] = useState(false);
  const wallet = useWallet();
  const [sites, setSites] = useState<any>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<string>();
  const { dispatch } = useAppContext();

  useEffect(() => {
    void (async () => {
      const data = await wallet.getConnectedSites();
      setSites(data);
    })();
  }, [Refresh]);
  const handleDelete = (origin: string) => {
    setVisible(true);
    setSelectedOrigin(origin);
  };
  const removeConnectedSites = async () => {
    await wallet.removeConnectedSite(selectedOrigin);
    setVisible(false);
    setRefresh(!Refresh);
    dispatch({
      type: ActionTypes.UpdateRefreshUseHooks,
      payload: [RefreshUseHooks.Connected_Site],
    });
  };
  return (
    <>
      <Modal
        title={null}
        className="modal-delete"
        open={visible}
        footer={null}
        closable={true}
        onCancel={() => setVisible(false)}
        width={368}
        centered
      >
        <div className="text-center text-white title-popup-delete">
          Delete this connected
        </div>
        <StrayButtons
          backTitle="CANCEL"
          nextTitle="DELETE"
          onBack={() => setVisible(false)}
          onNext={removeConnectedSites}
        />
      </Modal>
      <div className="mb-3 text-[16px] leading-5 px-[20px]">
        Connected sites
      </div>
      <div className="mb-3 max-h-40 overflow-y-auto thin-scrollbar">
        <ul className="px-[20px]">
          {sites.map((s, idx) => (
            <div className="sites-item" key={s.origin}>
              <li className="flex items-center mb-4 w-full flex-nowrap justify-between">
                <div
                  className="flex flex-row w-full"
                  onClick={() => window.open(s.origin, '_blank')}
                >
                  <div className="mr-2">
                    <Image width={24} height={24} src={s.icon} />
                  </div>
                  <div className="overflow-hidden item">{s.name}</div>
                </div>
                <div
                  className="icon-trash hover-overlay p-1 rounded-md w-fit"
                  onClick={() => handleDelete(s.origin)}
                >
                  <TrashIcon />
                </div>
              </li>
            </div>
          ))}
        </ul>
      </div>
      {/* <div className="flex mb-5">
        <span className="fill-white mr-[5px]">
          <PlusIcon />
        </span>
        <span
          className="text-14"
          onClick={() => {
            setOpen(!open);
          }}
        >
          Manually connect to current site
        </span>
      </div> */}
      {/* {open && (
        <>
          <div className="mb-5">
            <InputText placeHolder="http://www.chrome.com" />
          </div>
          <div className="mb-5 text-14">
            Select the account to use on this site:
          </div>
          <div className="w-full border border-white h-[68px] px-5 flex items-center space-x-3 mb-3 rounded-xl">
            <Checkbox />
            <img src={AvatarIcon} alt="" width={40} height={40} />
            <span>Account1</span>
          </div>
          <div className="flex mb-[30px] h-[54px] space-x-2">
            <div className="pt-1">
              <img src={AttentionIcon} alt="" className="scale-[2.0]" />
            </div>
            <div className="text-orange text-14">
              Warning: This site will have access see address, account balance,
              activity and suggest transactions to approve
            </div>
          </div>
          <div className="mb-5">
            <StrayButtons backTitle="CANCEL" nextTitle="CONNECT" />
          </div>
        </>
      )} */}
    </>
  );
};

export default ConnectSites;
