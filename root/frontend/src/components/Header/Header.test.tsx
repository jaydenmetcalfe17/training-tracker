import Header from './Header';
import { render } from "@testing-library/react";
import { BrowserRouter } from 'react-router-dom';

describe('Sample render test for Header', ()=>{
    it('Should render component', ()=>{
        render(
            <BrowserRouter>
                <Header 
                    user={null}
                    logout={vi.fn()}
                />
            </BrowserRouter>
        );
        expect(true).toBeTruthy()
    })
})