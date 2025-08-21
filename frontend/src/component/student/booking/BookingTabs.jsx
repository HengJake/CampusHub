import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import { useState } from "react"
import MyBookingsTab from "./MyBookingsTab"
import AvailableResourcesTab from "./AvailableResourcesTab"

const BookingTabs = ({ resources, bookings, currentUser, onBookRoom, onDeleteBooking, lastUpdated }) => {
    const [activeTab, setActiveTab] = useState(0)

    // Filter user's bookings
    const myBookings = bookings.filter(booking => {
        return booking?.studentId?._id === currentUser?.studentId;
    })

    const handleSwitchToResources = () => {
        setActiveTab(1) // Switch to Available Resources tab (index 1)
    }

    return (
        <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
            <TabList>
                <Tab>My Bookings ({myBookings.length})</Tab>
                <Tab>Available Resources ({resources.length})</Tab>
            </TabList>

            <TabPanels>
                {/* My Bookings Tab */}
                <TabPanel>
                    <MyBookingsTab
                        bookings={myBookings}
                        onDelete={onDeleteBooking}
                        onSwitchToResources={handleSwitchToResources}
                    />
                </TabPanel>

                {/* Available Resources Tab */}
                <TabPanel>
                    <AvailableResourcesTab
                        resources={resources}
                        onBookRoom={onBookRoom}
                        lastUpdated={lastUpdated}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default BookingTabs
