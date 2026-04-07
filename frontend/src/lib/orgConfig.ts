export interface OrgAssets {
    name: string;
    logoSrc: string;
    logoAltSrc: string;
    link: string | null;
    brandColor: string;
}

export function getOrgAssets(organizationName: string): OrgAssets {
    switch (organizationName) {
        case "University of Oregon":
            return {
                name: organizationName,
                logoSrc: "/uo-logo.png",
                logoAltSrc: "/uo-logo-alt.png",
                link: "https://map.uoregon.edu/",
                brandColor: "#00702F",
            };
        case "Oregon State University":
            return {
                name: organizationName,
                logoSrc: "/osu-logo-alt.png",
                logoAltSrc: "/osu-logo.png",
                link: "https://map.oregonstate.edu/",
                brandColor: "#D73F09",
            };
        default:
            return {
                name: organizationName || "Campus Security",
                logoSrc: "/campus-safety.png",
                logoAltSrc: "/campus-safety-alt.png",
                link: null,
                brandColor: "#1a237e",
            };
    }
}
