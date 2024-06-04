export const refineForSearch = (searchText="") => {
    if(!searchText){
        return ""
    }
    return searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}