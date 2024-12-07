import React from 'react';
import LinkIcon from '../../public/images/icons/link-arrow.svg';
import './style.scss';

const extensions = [
    {
        id: 'cGFoamNmaWNtaGZnamtkY2RhZG5hY2pkaWlucGlsbWQ=',
        name: 'Responsive Toolkit',
        imageUrl: 'images/icons/responsive-toolkit.png',
    },
    {
        id: 'ZWFpa2dsZ2twYWJrZ2pwY29maW1lZGVmYWxhYW9qaWw=',
        name: 'On-Page SEO Analyser',
        imageUrl: 'images/icons/seo-buddy.png',
    },
    {
        id: 'aGhhZXBiaWpjYmRobGpiam9jYmlsZWZkaG5rbmdlaHA=',
        name: 'Fullpage Screenshot',
        imageUrl: 'images/icons/fullpage-screenshot.png',
    },
    {
        id: 'bmxtb2VtbGJvaGJjamRvYmZlYmttanBra2RiZ25ia2k=',
        name: 'Amazon Price Tracker',
        imageUrl: 'images/icons/amazon-price-alert.png',
    },
    {
        id: 'Y2ZnbWNhbWxjZWhkY29lZ21uZ2pvZmlhZm5nbGhrZ28=',
        name: 'Ad-free Reader',
        imageUrl: 'images/icons/clean-reader.png',
    },
]
const MoreExtensionByDeveloper = () => {
    return (
        <div className='extension-list-overlay'>
            <div className="extension-header"><p className='overlay-title'>Other Extensions from this developer</p></div>
            {
                extensions.map(({id, name, imageUrl}) => {
                    return <div className="extension">
                        <img src={imageUrl} alt="" className='extension-icon' />
                        <a className='extension-details' href={`https://chromewebstore.google.com/detail/${atob(id)}`} target='_blank'>
                            <h4 className='extension-title'>{name}</h4>
                            <img src={LinkIcon} className='sm-icon' />
                        </a>
                    </div>
                })
            }
        </div>
    );
};

export default MoreExtensionByDeveloper;
