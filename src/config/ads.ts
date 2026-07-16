export type BannerType =
  | 'banner-468x60'
  | 'banner-300x250'
  | 'banner-160x300'
  | 'banner-160x600'
  | 'banner-320x50'
  | 'banner-728x90';

export type AdType = BannerType | 'native-banner';

export interface BannerSlot {
  type: BannerType;
  width: number;
  height: number;
  src: string;
}

export interface NativeSlot {
  type: 'native-banner';
  containerId: string;
  scriptUrl: string;
}

export type AdSlot = BannerSlot | NativeSlot;

const ADS_BASE_PATH = '/ads';

// 468x60:   key = 1cbc24394bb0dd527263af73713d8da0
// 300x250:  key = 72ccb96a4420f95ac945870a99cc40dd
// 160x300:  key = cdc7e2338181ca173373a289e3bf12cf
// 160x600:  key = e099b6e1a7b9391fe1b65354b3a48f47
// 320x50:   key = 90013b17875d1ff0e206508a6c19765b
// 728x90:   key = af80c0f230378c415fe76795ba34e03f

export const BANNER_SLOTS: Record<BannerType, BannerSlot> = {
  'banner-468x60': {
    type: 'banner-468x60',
    width: 468,
    height: 60,
    src: `${ADS_BASE_PATH}/banner-468x60.html`,
  },
  'banner-300x250': {
    type: 'banner-300x250',
    width: 300,
    height: 250,
    src: `${ADS_BASE_PATH}/banner-300x250.html`,
  },
  'banner-160x300': {
    type: 'banner-160x300',
    width: 160,
    height: 300,
    src: `${ADS_BASE_PATH}/banner-160x300.html`,
  },
  'banner-160x600': {
    type: 'banner-160x600',
    width: 160,
    height: 600,
    src: `${ADS_BASE_PATH}/banner-160x600.html`,
  },
  'banner-320x50': {
    type: 'banner-320x50',
    width: 320,
    height: 50,
    src: `${ADS_BASE_PATH}/banner-320x50.html`,
  },
  'banner-728x90': {
    type: 'banner-728x90',
    width: 728,
    height: 90,
    src: `${ADS_BASE_PATH}/banner-728x90.html`,
  },
};

// key = ec6f8dfd0925b42f0a02f5001cabc4f0
export const NATIVE_SLOT: NativeSlot = {
  type: 'native-banner',
  containerId: 'container-ec6f8dfd0925b42f0a02f5001cabc4f0',
  scriptUrl: '//pl30384773.effectivecpmnetwork.com/ec6f8dfd0925b42f0a02f5001cabc4f0/invoke.js',
};

export const AD_SLOTS: Record<BannerType, BannerSlot> & { 'native-banner': NativeSlot } = {
  ...BANNER_SLOTS,
  'native-banner': NATIVE_SLOT,
};
