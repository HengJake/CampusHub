import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import MyBookingsTab from "./MyBookingsTab"
import AvailableResourcesTab from "./AvailableResourcesTab"

const BookingTabs = ({ resources, bookings, currentUser, onBookRoom, onDeleteBooking, lastUpdated }) => {
    // Filter user's bookings
    const myBookings = bookings.filter(booking => {
        return booking?.studentId?._id === currentUser?.studentId;
    })

    return (
        <Tabs variant="enclosed" colorScheme="blue">
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
