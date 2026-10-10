// Tab screens live inside the "MainTabs" navigator, so stack screens must
// navigate through it to switch tabs.
export const goToTab = (navigation, tab, params) => navigation.navigate('MainTabs', { screen: tab, params });
