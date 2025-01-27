// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { ChangeSeats } from "./change-seats";
import { Webinar } from "../entities/webinar.entity";
import { User } from "src/users/entities/user.entity";


describe('Feature : Change seats', () => {
  
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  function expectWebinarToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('webinar-id');
    expect(webinar?.props.seats).toEqual(100);
  }

  function whenUserChangeSeatsWith(payload: { user: User; webinarId: string; seats: number; }) {
    return useCase.execute(payload);
  }

  async function thenUpdatedWebinarSeatsShouldBe(seats: any){
    const updatedWebinar = await webinarRepository.findById('webinar-id');
    expect(updatedWebinar?.props.seats).toEqual(seats);
  }

  describe('Scenario: Happy path', () => {
  
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };

    it('should change the number of seats for a webinar', async () => {

      await whenUserChangeSeatsWith(payload);

      thenUpdatedWebinarSeatsShouldBe(200);

    });
  });

  describe('Scenario: webinar does not exist', () => {

    const payload = {
      user: testUser.alice,
      webinarId: 'no-webinar-id',
      seats: 200,
    };

    it('should fail', async () => {

      expectWebinarToRemainUnchanged();
      await expect( whenUserChangeSeatsWith(payload)).rejects.toThrow('Webinar not found');});

  });

  describe('update the webinar of someone else', () => {

    const payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 200,
    };

    it('should fail', async () => {

      expectWebinarToRemainUnchanged();
      await expect( whenUserChangeSeatsWith(payload)).rejects.toThrow('User is not allowed to update this webinar');});

  });

  describe('change seat to an inferior number', () => {

    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: -5,
    };

    it('should fail', async () => {

      expectWebinarToRemainUnchanged();
      await expect( whenUserChangeSeatsWith(payload)).rejects.toThrow('You cannot reduce the number of seats');});

  });

  describe('change seat to a number > 1000', () => {

    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1010,
    };

    it('should fail', async () => {

      expectWebinarToRemainUnchanged();
      await expect( whenUserChangeSeatsWith(payload)).rejects.toThrow('Webinar must have at most 1000 seats');});

  });


});