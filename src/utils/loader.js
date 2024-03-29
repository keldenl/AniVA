import React from "react";
import ContentLoader from "react-content-loader";

export const VA_PROFILE = (
  <ContentLoader
    height={120}
    width={250}
    speed={2}
    primaryColor="#424242"
    secondaryColor="#656565"
  >
    <rect x="0" y="0" width="55" height="75" />
    <rect x="65" y="10" width="70%" height="15" />
    <rect x="65" y="35" width="70%" height="30" />
  </ContentLoader>
);

export const ENTRY_CHARACTER = [0, 1, 2, 3, 4, 5].map((idx) => {
  return (
    <a key={idx} className="entry-char entry-char-load">
      <ContentLoader
        height={120}
        width={250}
        speed={2}
        primaryColor="#424242"
        secondaryColor="#656565"
      >
        <rect x="0" y="0" width="55" height="75" />
        <rect x="65" y="10" width="70%" height="15" />
        <rect x="65" y="35" width="70%" height="30" />
      </ContentLoader>
    </a>
  );
});
