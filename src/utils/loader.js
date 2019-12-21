import React from 'react';
import ContentLoader from 'react-content-loader'

export const VA_PROFILE = 
    <ContentLoader 
        height={475}
        width={250}
        speed={2}
        primaryColor="#424242"
        secondaryColor="#656565">

    <rect x="0" y="0" width="100%" height="300" />
    <rect x="20" y="320" width="210" height="17" /> 
    <rect x="20" y="355" width="180" height="7" />
    <rect x="20" y="370" width="160" height="7" />
    </ContentLoader>;

export const ENTRY_CHARACTER = [0,1,2,3,4,5].map(idx => {
    return (<a key={idx} className="entry-char entry-char-load">
    <ContentLoader 
        height={120}
        width={250}
        speed={2}
        primaryColor="#424242"
        secondaryColor="#656565">
            
        <rect x="0" y="0"  width="55" height="90" /> 
        <rect x="65" y="10" width="70%" height="20" /> 
        <rect x="65" y="40" width="70%" height="40" />
    </ContentLoader>
    </a>);
});