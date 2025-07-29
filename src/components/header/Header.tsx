const Header = ()=> {
return (
    <>
        <header className="flex gap-2 m-4">
            <img className="w-6 cursor-pointer" src={`${import.meta.env.BASE_URL}map-pin.svg`} alt="GA" title="GA"/>
            <h1 className=" font-semibold display-inline-block color-action-default">{"Geo App"}</h1>
        </header>
        <hr/>
    </>
    
);
}
export default Header;