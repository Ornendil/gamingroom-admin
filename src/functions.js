export function getToday() {// Get the current day's name
    const days = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
    const today = days[new Date().getDay()];
    return today;
}

export function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return new Date(new Date().setHours(hours, minutes, 0, 0));
};

export function generateTimeSlots(settings) {

    // Get the opening and closing times for the current day
    const { fra, til } = settings.aapningstider[settings.today];

    // Convert the opening and closing times to Date objects
    const fraDate = new Date(`1970-01-01T${fra}:00Z`);
    const tilDate = new Date(`1970-01-01T${til}:00Z`);

    // Generate the time slots
    const timeSlots = [];
    let i = 1;
    while (fraDate < tilDate) {
        const fra = fraDate.toISOString().slice(11, 16);  // Extract HH:mm
        fraDate.setMinutes(fraDate.getMinutes() + settings.timeSlotSize);     // Increment by x minutes
        const til = fraDate.toISOString().slice(11, 16);   // Extract HH:mm
        timeSlots.push({ fra, til, i });
        i++;
    }

    return timeSlots;
}

export function getTimeSlotBelow(x, y) {
    let elements = document.elementsFromPoint(x, y);
    let timeSlot = elements.find(element =>
        element.classList.contains('time-slot') && element.parentElement.classList.contains('time-slots')
    );
    return timeSlot;
}

export function getDraggableBelow(x, y, target) {
    let elements = document.elementsFromPoint(x, y);
    let draggable = elements.find(element =>
        element.classList.contains('session') && element !== target
    );
    return draggable;
}



export async function apiRequest(
    endpoint,
    data = {},
    updateState = () => {},
    method = 'POST',
    additionalHeaders = {}
) {

    const csrfToken = localStorage.getItem('csrfToken');

    // Determine the URL and body based on method
    const url = method === 'GET' 
        ? `api/${endpoint}/?${new URLSearchParams(data).toString()}`
        : `api/${endpoint}/`;
    const body = method === 'POST'
        ? new URLSearchParams(data).toString()
        : undefined;

    try {
        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'X-CSRF-Token': csrfToken,
                ...additionalHeaders, // Include any additional headers if needed
            },
            body,
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized errors by logging out
                logout();
                throw new Error('Unauthorized - Logging out');
            }
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const responseData = await response.json();

        // Update the state if applicable
        if (updateState && typeof updateState === 'function') {
            updateState(responseData);
        }

        return responseData;

    } catch (error) {
        console.error(`Error with API request to ${endpoint}:`, error);
        throw error; // Re-throw the error for further handling if needed
    }
}


export function updateTime(data, updateDataEntry) {
    return apiRequest(
        'update/time',
        {
            id: data.id,
            slot: data.slot,
            fra: data.fra,
            til: data.til,
            computer: data.computer,
        },
        (responseData) => updateDataEntry({ ...data, ...responseData })
    );
}

export function updateName(data, newName, updateDataEntry) {
    return apiRequest(
        'update/name',
        { id: data.id, navn: newName },
        (responseData) => updateDataEntry({ ...data, navn: newName })
    );
}

export function updateLnr(data, newLnr, updateDataEntry) {
    return apiRequest(
        'update/lnr',
        { id: data.id, lnr: newLnr },
        (responseData) => updateDataEntry({ ...data, lnr: newLnr })
    );
}

export function updateStatus(data, newStatus, updateDataEntry) {
    return apiRequest(
        'update/status',
        { id: data.id, status: newStatus },
        (responseData) => updateDataEntry({ ...data, status: newStatus })
    );
}

export function deleteSession(session, removeDataEntry) {
    return apiRequest(
        'delete',
        { id: session.id },
        () => removeDataEntry(session.id)
    );
}

export function save(data, addDataEntry) {
    console.log(data);
    return apiRequest(
        'save',
        {
            time_slot: data.timeSlot,
            navn: data.name,
            lnr: data.lnr,
            fra: data.fra,
            til: data.til,
            status: 'scheduled',
            computer: data.computer
        },
        (responseData) => {
            if (addDataEntry && responseData.sessions) {
                const newSession = responseData.sessions[responseData.sessions.length - 1];
                addDataEntry(newSession);
            }
        }
    );
}

export function getSessions(setData){
    return apiRequest(
        'data',
        {},
        (responseData) => {
            setData(responseData);
        },
        'GET'
    );
}



export async function login(username, password, setIsLoggedIn) {
    try {
        const returnData = await generateLoginTokens(username, password);
        if (returnData.status === 'success') {
            localStorage.setItem('accessToken', returnData.accessToken);
            localStorage.setItem('csrfToken', returnData.csrfToken);
            setIsLoggedIn(true);
        } else {
            console.log('Wrong credentials or something.');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
};

export async function logout(setIsLoggedIn) {
    try {
        // Call the logout endpoint to clear the refresh token server-side
        const response = await fetch('api/logout', {
            method: 'POST',
            credentials: 'include', // Send cookies along with the request
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to log out on the server');
        }

        // Clear access token from local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('csrfToken');

        // Optionally clear other related states
        setIsLoggedIn(false);
        // setAccessToken(null);
        
    } catch (error) {
        console.error('Error logging out:', error);
    }
};



export function generateLoginTokens(username, password) {
    return fetch('api/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ "username":username, "password":password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            // Return the tokens for further use
            return data;
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to refresh the Access Token using the Refresh Token
export async function refreshAccessToken(setAccessToken, setIsLoggedIn) {
    try {
        const response = await fetch('api/refresh/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to refresh access token');
        }

        const data = await response.json();

        if (data.accessToken) {
            setAccessToken(data.accessToken);
            localStorage.setItem('accessToken', data.accessToken);
            setIsLoggedIn(true);
        } else {
            // setIsLoggedIn(false);
            logout(setIsLoggedIn);
            throw new Error('Access Token not provided');
        }
    } catch (error) {
        if (error.message === 'Failed to refresh access token') {
        } else {
            console.error('Error refreshing access token:', error);
        }
        logout(setIsLoggedIn);
    }
};


export function checkForValidDrop(event, getTimeSlotBelow, getDraggableBelow) {
    const timeSlot = getTimeSlotBelow(event.clientX, event.clientY);
    if (timeSlot) {
        const timeSlotData = timeSlot.dataset;
        const draggableBelow = getDraggableBelow(event.clientX, event.clientY, event.target);
        const draggableAfter = getDraggableBelow(event.clientX, event.clientY + timeSlot.clientHeight + 5, event.target);
        const draggableBelow2 = getDraggableBelow(event.clientX + 1, event.clientY, event.target);
        const draggableAfter2 = getDraggableBelow(event.clientX + 1, event.clientY + timeSlot.clientHeight + 5, event.target);
        const timeSlotAfter = getTimeSlotBelow(event.clientX, event.clientY + timeSlot.clientHeight + 5);

        if (draggableAfter === undefined && draggableBelow === undefined &&
            draggableAfter2 === undefined && draggableBelow2 === undefined &&
            timeSlotAfter !== undefined) {
            return timeSlotData;
        }
    }
    return null;
}