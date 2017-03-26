import { D3JS280FinalPage } from './app.po';

describe('d3-js280-final App', () => {
  let page: D3JS280FinalPage;

  beforeEach(() => {
    page = new D3JS280FinalPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
