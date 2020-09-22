import React from 'react';
import DeviceSelectionScreen from './DeviceSelectionScreen';
import { shallow } from 'enzyme';
import { Steps } from '../PreJoinScreens';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

jest.mock('../../../hooks/useVideoContext/useVideoContext');
jest.mock('../../../state');

const mockUseAppState = useAppState as jest.Mock<any>;
const mockUseVideoContext = useVideoContext as jest.Mock<any>;

const mockConnect = jest.fn();
const mockGetToken = jest.fn(() => Promise.resolve('mockToken'));

mockUseAppState.mockImplementation(() => ({ getToken: mockGetToken, isFetching: false }));
mockUseVideoContext.mockImplementation(() => ({
  connect: mockConnect,
  isAcquiringLocalTracks: false,
  isConnecting: false,
}));

describe('the DeviceSelectionScreen component', () => {
  it('should disable the Join Room button when connecting to a room', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      connect: mockConnect,
      isAcquiringLocalTracks: false,
      isConnecting: true,
    }));
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    expect(wrapper.find({ children: 'Join Room' }).prop('disabled')).toBe(true);
  });

  it('should disable the Join Room button when acquiring local tracks', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      connect: mockConnect,
      isAcquiringLocalTracks: true,
      isConnecting: false,
    }));
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    expect(wrapper.find({ children: 'Join Room' }).prop('disabled')).toBe(true);
  });

  it('should disable the Join Room button when fetching a token', () => {
    mockUseVideoContext.mockImplementationOnce(() => ({
      connect: mockConnect,
      isAcquiringLocalTracks: false,
      isConnecting: false,
    }));
    mockUseAppState.mockImplementationOnce(() => ({ getToken: mockGetToken, isFetching: true }));
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    expect(wrapper.find({ children: 'Join Room' }).prop('disabled')).toBe(true);
  });

  it('should not disable the Join Room button by default', () => {
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    expect(wrapper.find({ children: 'Join Room' }).prop('disabled')).toBe(false);
  });

  it('should go back to the RoomNameScreen when the Cancel button is clicked', () => {
    const mockSetStep = jest.fn();
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={mockSetStep} />);
    wrapper.find({ children: 'Cancel' }).simulate('click');
    expect(mockSetStep).toHaveBeenCalledWith(Steps.roomNameStep);
  });

  it('should fetch a token and connect to a room when the Join Room button is clicked', done => {
    const wrapper = shallow(<DeviceSelectionScreen name="test name" roomName="test room name" setStep={() => {}} />);
    wrapper.find({ children: 'Join Room' }).simulate('click');

    expect(mockGetToken).toHaveBeenCalledWith('test name', 'test room name');
    setImmediate(() => {
      expect(mockConnect).toHaveBeenCalledWith('mockToken');
      done();
    });
  });
});
