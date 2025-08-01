interface IHeaderProps {
    title?: string;
    logo?: { src: string, alt: string, tl: string };
}

const Header = ({ 
    title = "Geo App",
    logo = {
        src: `${import.meta.env.BASE_URL}map-pin.svg`,
        alt: "GA",
        tl: "GA"
    } }: IHeaderProps) => {
    const { src, alt, tl } = logo;
    
    return (
        <>
            <header className="flex gap-2 m-4">
                <img className="w-6 cursor-pointer" src={src} alt={alt} title={tl} />
                <h1 className=" font-semibold display-inline-block color-action-default">{title}</h1>
            </header>
            <hr />
        </>

    );
}
export default Header;