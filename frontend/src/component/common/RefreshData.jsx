import React from 'react'
import { IoMdRefreshCircle } from "react-icons/io";
import { Button, IconButton } from '@chakra-ui/react';
function RefreshData() {

    const handleRefresh = () => {
        console.log("Refresh Data")
    }

    return (
        <IconButton
            aria-label='Refresh Data'
            icon={<IoMdRefreshCircle />}
            onClick={handleRefresh}
        />
    )
}

export default RefreshData